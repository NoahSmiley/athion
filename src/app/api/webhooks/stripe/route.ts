import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import type Stripe from "stripe";

// Map price IDs to product name
function getProduct(priceId: string): string {
  const priceToProduct: Record<string, string> = {
    [process.env.STRIPE_PRICE_ATHION_PRO_MONTHLY!]: "athion_pro",
    [process.env.STRIPE_PRICE_ATHION_PRO_YEARLY!]: "athion_pro",
    [process.env.STRIPE_PRICE_ADDON_MINECRAFT!]: "addon_minecraft",
    [process.env.STRIPE_PRICE_ADDON_FACTORIO!]: "addon_factorio",
    [process.env.STRIPE_PRICE_ADDON_SATISFACTORY!]: "addon_satisfactory",
    [process.env.STRIPE_PRICE_ADDON_CS2_SURF!]: "addon_cs2_surf",
    [process.env.STRIPE_PRICE_ADDON_HOSTING!]: "addon_hosting",
    [process.env.STRIPE_PRICE_ADDON_VPS!]: "addon_vps",
  };
  return priceToProduct[priceId] ?? "athion_pro";
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // Look up user by stripe_customer_id
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) {
    console.error("No user found for customer:", customerId);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item.price.id;

  // Access period fields from the subscription item (Stripe API v2025+)
  const periodStart = item.current_period_start;
  const periodEnd = item.current_period_end;

  await db
    .insert(subscriptions)
    .values({
      id: subscription.id,
      userId: user.id,
      status: subscription.status,
      product: getProduct(priceId),
      stripePriceId: priceId,
      currentPeriodStart: periodStart
        ? new Date(periodStart * 1000)
        : null,
      currentPeriodEnd: periodEnd
        ? new Date(periodEnd * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: subscription.status,
        stripePriceId: priceId,
        currentPeriodStart: periodStart
          ? new Date(periodStart * 1000)
          : null,
        currentPeriodEnd: periodEnd
          ? new Date(periodEnd * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
  }

  return NextResponse.json({ received: true });
}

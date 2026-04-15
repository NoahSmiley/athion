import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import type Stripe from "stripe";

function getProduct(priceId: string): string {
  const map: Record<string, string> = { [process.env.STRIPE_PRICE_ATHION_PRO_MONTHLY!]: "athion_pro", [process.env.STRIPE_PRICE_ATHION_PRO_YEARLY!]: "athion_pro" };
  return map[priceId] ?? "athion_pro";
}

async function upsertSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
  if (!user) return;

  const item = sub.items.data[0];
  const start = item.current_period_start ? new Date(item.current_period_start * 1000) : null;
  const end = item.current_period_end ? new Date(item.current_period_end * 1000) : null;
  const values = { id: sub.id, userId: user.id, status: sub.status, product: getProduct(item.price.id), stripePriceId: item.price.id, currentPeriodStart: start, currentPeriodEnd: end, cancelAtPeriodEnd: sub.cancel_at_period_end };

  await db.insert(subscriptions).values(values).onConflictDoUpdate({
    target: subscriptions.id,
    set: { status: sub.status, stripePriceId: item.price.id, currentPeriodStart: start, currentPeriodEnd: end, cancelAtPeriodEnd: sub.cancel_at_period_end },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); }

  if (event.type.startsWith("customer.subscription.")) {
    await upsertSubscription(event.data.object as Stripe.Subscription);
  }
  return NextResponse.json({ received: true });
}

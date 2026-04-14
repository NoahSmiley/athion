import Link from "next/link";
import { eq, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export default async function DashboardPage() {
  const user = await getSession();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  const subs = user
    ? await db.select().from(subscriptions).where(and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ["active", "trialing"])))
    : [];
  const active = subs.some((s) => s.product === "athion" || s.product === "athion_pro");

  return (
    <>
      <h1>Welcome back, {displayName}.</h1>
      <p className="muted">Manage your account and subscriptions.</p>
      <h2>Subscription</h2>
      {active ? (
        <p>Status: <b>Active</b> &mdash; Full access to Flux and Liminal IDE.</p>
      ) : (
        <p className="muted">No active subscription. <Link href="/pricing">Subscribe</Link></p>
      )}
      <h2>Quick Links</h2>
      <ul>
        <li><Link href="/dashboard/billing">Manage billing</Link></li>
        <li><Link href="/dashboard/downloads">Downloads</Link></li>
        <li><Link href="/dashboard/settings">Account settings</Link></li>
      </ul>
    </>
  );
}

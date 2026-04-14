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
      <p>Welcome back, {displayName}.</p>
      <p className="muted" style={{ marginTop: 12 }}>
        Subscription: {active ? <><b>Active</b> &mdash; Full access to Flux and Liminal IDE.</> : <>None. <Link href="/pricing">Subscribe</Link></>}
      </p>
    </>
  );
}

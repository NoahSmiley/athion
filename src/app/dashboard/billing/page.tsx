import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { PortalButton } from "./portal-button";

export default async function BillingPage() {
  const user = await getSession();
  const subs = user ? await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).orderBy(desc(subscriptions.createdAt)) : [];

  return (
    <>
      <h1>Billing</h1>
      <p className="muted">Manage your subscriptions and payment methods.</p>
      <h2>Subscriptions</h2>
      {subs.length > 0 ? (
        <table>
          <thead><tr><th>Product</th><th>Status</th><th>Period End</th></tr></thead>
          <tbody>
            {subs.map((sub) => (
              <tr key={sub.id}>
                <td><b>{sub.product === "game_servers" ? "Game Servers" : sub.product}</b></td>
                <td>{sub.status}{sub.cancelAtPeriodEnd && " (cancels at period end)"}</td>
                <td className="muted">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">No active subscriptions.</p>
      )}
      <div style={{ marginTop: 16 }}><PortalButton /></div>
    </>
  );
}

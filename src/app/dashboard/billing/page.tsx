import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { PortalButton } from "./portal-button";

export default async function BillingPage() {
  const user = await getSession();

  const subs = user
    ? await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(desc(subscriptions.createdAt))
    : [];

  return (
    <div className="max-w-4xl">
      <h1 className="font-[590] text-3xl tracking-[-0.022em]">Billing</h1>
      <p className="mt-2 text-foreground-muted">
        Manage your subscriptions and payment methods.
      </p>

      {subs.length > 0 ? (
        <div className="mt-10 flex flex-col gap-4">
          {subs.map((sub) => (
            <div
              key={sub.id}
              className="p-6 border border-border rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium capitalize">
                  {sub.product === "game_servers" ? "Game Servers" : sub.product}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Status: <span className="capitalize">{sub.status}</span>
                  {sub.cancelAtPeriodEnd && " (cancels at period end)"}
                </p>
                {sub.currentPeriodEnd && (
                  <p className="text-xs text-foreground-muted">
                    Current period ends:{" "}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 p-8 border border-border rounded-lg text-center">
          <p className="text-foreground-muted">No active subscriptions.</p>
        </div>
      )}

      <div className="mt-8">
        <PortalButton />
      </div>
    </div>
  );
}

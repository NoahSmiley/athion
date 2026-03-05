import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { eq, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export default async function DashboardPage() {
  const user = await getSession();

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  // Fetch subscriptions
  const subs = user
    ? await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, user.id),
            inArray(subscriptions.status, ["active", "trialing"])
          )
        )
    : [];

  const activeProducts = subs.map((s) => s.product);

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl tracking-[-0.02em]">
        Welcome back, {displayName}.
      </h1>
      <p className="mt-2 text-foreground-muted">
        Manage your account and subscriptions.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {/* Subscription status cards */}
        <div className="p-6 border border-border rounded-sm">
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
            Flux
          </p>
          {activeProducts.includes("flux") ? (
            <p className="text-sm text-accent">Active</p>
          ) : (
            <>
              <p className="text-sm text-foreground-muted">No subscription</p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors"
              >
                Subscribe <ArrowRight size={10} />
              </Link>
            </>
          )}
        </div>

        <div className="p-6 border border-border rounded-sm">
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
            Game Servers
          </p>
          {activeProducts.includes("game_servers") ? (
            <p className="text-sm text-accent">Active</p>
          ) : (
            <>
              <p className="text-sm text-foreground-muted">No subscription</p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors"
              >
                Subscribe <ArrowRight size={10} />
              </Link>
            </>
          )}
        </div>

        <div className="p-6 border border-border rounded-sm">
          <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3">
            Liminal IDE
          </p>
          <p className="text-sm text-accent">Free — included</p>
        </div>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/billing"
          className="p-4 border border-border rounded-sm text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
        >
          Manage billing
        </Link>
        <Link
          href="/dashboard/downloads"
          className="p-4 border border-border rounded-sm text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
        >
          Downloads
        </Link>
        <Link
          href="/dashboard/settings"
          className="p-4 border border-border rounded-sm text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
        >
          Account settings
        </Link>
      </div>
    </div>
  );
}

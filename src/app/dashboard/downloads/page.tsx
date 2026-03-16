import { Apple, MonitorDot } from "lucide-react";
import { eq, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export default async function DownloadsPage() {
  const user = await getSession();

  const subs = user
    ? await db
        .select({ product: subscriptions.product })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, user.id),
            inArray(subscriptions.status, ["active", "trialing"])
          )
        )
    : [];

  const activeProducts = subs.map((s) => s.product);
  const hasSubscription = activeProducts.includes("athion_pro") || activeProducts.includes("athion");

  return (
    <div className="max-w-4xl">
      <h1 className="font-[590] text-3xl tracking-[-0.022em]">Downloads</h1>
      <p className="mt-2 text-foreground-muted">
        Download Athion apps for your platform.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {/* Flux */}
        <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[590] text-xl tracking-[-0.012em]">Flux</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Voice & text chat desktop app
              </p>
            </div>
            {!hasSubscription && (
              <span className="text-xs text-foreground-muted border border-border px-2 py-0.5">
                Subscription required
              </span>
            )}
          </div>

          {hasSubscription ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/download/mac"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium rounded-[6px] hover:bg-accent-hover shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all duration-150"
              >
                <Apple size={16} />
                macOS
              </a>
              <a
                href="/download/windows"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-light hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150"
              >
                <MonitorDot size={16} />
                Windows
              </a>
            </div>
          ) : (
            <p className="mt-4 text-sm text-foreground-muted">
              Subscribe to Athion to access downloads.
            </p>
          )}
        </div>

        {/* IDE — included with subscription */}
        <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-[590] text-xl tracking-[-0.012em]">Liminal IDE</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                AI-native code editor
              </p>
            </div>
            <span className="text-xs text-accent border border-accent/30 px-2 py-0.5">
              Coming Soon
            </span>
          </div>
          <p className="mt-4 text-sm text-foreground-muted">
            IDE downloads will be available when we launch. Join the waitlist on
            the{" "}
            <a href="/ide" className="text-accent hover:text-foreground transition-colors">
              IDE page
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

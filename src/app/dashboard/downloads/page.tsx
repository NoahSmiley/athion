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
  const hasFlux = activeProducts.includes("flux");

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl tracking-[-0.02em]">Downloads</h1>
      <p className="mt-2 text-foreground-muted">
        Download Athion apps for your platform.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        {/* Flux */}
        <div className="p-6 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl">Flux</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Voice & text chat desktop app
              </p>
            </div>
            {!hasFlux && (
              <span className="text-xs text-foreground-muted border border-border px-2 py-0.5">
                Subscription required
              </span>
            )}
          </div>

          {hasFlux ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Apple size={16} />
                macOS (Apple Silicon)
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm text-foreground-muted hover:text-foreground hover:border-border-light transition-colors"
              >
                <Apple size={16} />
                macOS (Intel)
              </a>
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm text-foreground-muted/50 cursor-not-allowed"
              >
                <MonitorDot size={16} />
                Windows — Soon
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-foreground-muted">
              Subscribe to Flux to access downloads.
            </p>
          )}
        </div>

        {/* IDE — always free */}
        <div className="p-6 border border-border rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl">Liminal IDE</h3>
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

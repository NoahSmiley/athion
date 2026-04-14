import { eq, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

export default async function DownloadsPage() {
  const user = await getSession();
  const subs = user ? await db.select({ product: subscriptions.product }).from(subscriptions).where(and(eq(subscriptions.userId, user.id), inArray(subscriptions.status, ["active", "trialing"]))) : [];
  const hasSub = subs.some((s) => s.product === "athion_pro" || s.product === "athion");

  return (
    <>
      <h1>Downloads</h1>
      <p className="muted">Download Athion apps for your platform.</p>
      <h2>Flux</h2>
      <p className="muted">Voice & text chat desktop app.</p>
      {hasSub ? (
        <ul>
          <li><a href="/download/mac">macOS</a></li>
          <li><a href="/download/windows">Windows</a></li>
        </ul>
      ) : (
        <p className="muted">Subscribe to Athion to access downloads.</p>
      )}
      <h2>Liminal IDE</h2>
      <p className="muted">AI-native code editor. <i>Coming soon.</i></p>
    </>
  );
}

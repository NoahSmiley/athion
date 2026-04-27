import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatChannels } from "@/lib/db/schema";

// Ensure an interview channel exists for an application. Returns its slug.
// Idempotent — safe to call multiple times.
export async function ensureInterviewChannel(applicationId: string): Promise<string> {
  const existing = await db
    .select({ slug: chatChannels.slug })
    .from(chatChannels)
    .where(eq(chatChannels.applicationId, applicationId))
    .limit(1);
  if (existing[0]) return existing[0].slug;

  // Slug = "interview-" + first 8 chars of the application UUID. Stable + unique.
  const slug = `interview-${applicationId.slice(0, 8)}`;
  await db.insert(chatChannels).values({
    slug,
    name: `Interview ${applicationId.slice(0, 8)}`,
    description: null,
    kind: "interview",
    applicationId,
  });
  return slug;
}

// Mark an interview channel closed (read-only) when the application is decided.
export async function closeInterviewChannel(applicationId: string): Promise<void> {
  await db
    .update(chatChannels)
    .set({ closedAt: new Date() })
    .where(eq(chatChannels.applicationId, applicationId));
}

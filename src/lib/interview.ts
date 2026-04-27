import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatChannels } from "@/lib/db/schema";

// Two channels per application:
// - "application-<id>" (kind=application): always-on async thread for casual
//   admin/applicant DMs. Created on mark_in_review.
// - "interview-<id>" (kind=interview): scheduled interview surface. Created
//   when an interview is scheduled. Read/write only inside [interviewAt,
//   interviewAt + duration]. Closed permanently after decision.

export async function ensureApplicationChannel(applicationId: string): Promise<string> {
  const existing = await db
    .select({ slug: chatChannels.slug })
    .from(chatChannels)
    .where(and(eq(chatChannels.applicationId, applicationId), eq(chatChannels.kind, "application")))
    .limit(1);
  if (existing[0]) return existing[0].slug;

  const slug = `application-${applicationId.slice(0, 8)}`;
  await db.insert(chatChannels).values({
    slug,
    name: `Application ${applicationId.slice(0, 8)}`,
    description: null,
    kind: "application",
    applicationId,
  });
  return slug;
}

export async function ensureInterviewChannel(applicationId: string): Promise<string> {
  const existing = await db
    .select({ slug: chatChannels.slug })
    .from(chatChannels)
    .where(and(eq(chatChannels.applicationId, applicationId), eq(chatChannels.kind, "interview")))
    .limit(1);
  if (existing[0]) return existing[0].slug;

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

// Close all of an application's channels (application + interview) on decision.
export async function closeApplicationChannels(applicationId: string): Promise<void> {
  await db
    .update(chatChannels)
    .set({ closedAt: new Date() })
    .where(eq(chatChannels.applicationId, applicationId));
}

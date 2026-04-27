import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, chatChannels } from "@/lib/db/schema";
import { InterviewRoom } from "../interview-room";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview",
  robots: { index: false, follow: false },
};

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();

  const rows = await db
    .select({
      id: accessRequests.id,
      email: accessRequests.email,
      status: accessRequests.status,
      interviewAt: accessRequests.interviewAt,
      interviewNote: accessRequests.interviewNote,
    })
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);
  const app = rows[0];
  if (!app) notFound();

  const channelRows = await db
    .select({ closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(eq(chatChannels.applicationId, app.id))
    .limit(1);
  const channel = channelRows[0] ?? null;

  return (
    <>
      <h1>Interview</h1>
      <p className="muted">{app.email}</p>

      {app.interviewAt && (
        <p style={{ marginTop: 8 }}>
          <b>Scheduled:</b> {new Date(app.interviewAt).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
        </p>
      )}

      {app.interviewNote && (
        <p className="muted" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{app.interviewNote}</p>
      )}

      <div style={{ marginTop: 16 }}>
        {channel ? (
          <InterviewRoom
            wsPath={`/ws-app/${app.id}`}
            me={{ kind: "applicant" }}
            closed={!!channel.closedAt}
            emptyHint="The interview happens here. Athion will start when you join."
          />
        ) : (
          <p className="muted" style={{ fontSize: 12 }}>
            The interview chat opens once your application is in review.
          </p>
        )}
      </div>

      <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
        <Link href={`/application/${app.id}`}>← Back to application status</Link>
      </p>
    </>
  );
}

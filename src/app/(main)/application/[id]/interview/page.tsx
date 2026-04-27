import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, chatChannels, chatMessages } from "@/lib/db/schema";
import { InterviewRoom } from "../interview-room";
import { InterviewWindow } from "./interview-window";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview",
  robots: { index: false, follow: false },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const rows = await db
    .select({
      id: accessRequests.id,
      email: accessRequests.email,
      status: accessRequests.status,
      interviewAt: accessRequests.interviewAt,
      interviewDurationMinutes: accessRequests.interviewDurationMinutes,
      interviewNote: accessRequests.interviewNote,
    })
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);
  const app = rows[0];
  if (!app) notFound();

  const channelRows = await db
    .select({ id: chatChannels.id, closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(and(eq(chatChannels.applicationId, app.id), eq(chatChannels.kind, "interview")))
    .limit(1);
  const channel = channelRows[0] ?? null;

  let messageCount = 0;
  if (channel) {
    const counts = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channel.id));
    messageCount = counts[0]?.n ?? 0;
  }

  if (!app.interviewAt || !channel) {
    return (
      <>
        <h1>Interview</h1>
        <p className="muted" style={{ marginTop: 16 }}>No interview scheduled yet.</p>
        <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
          <Link href={`/application/${app.id}`}>← Back to application</Link>
        </p>
      </>
    );
  }

  const startMs = new Date(app.interviewAt).getTime();
  const endMs = startMs + app.interviewDurationMinutes * 60 * 1000;
  const closed = !!channel.closedAt;

  return (
    <>
      <p className="muted" style={{ fontSize: 11, marginBottom: 8 }}>
        <Link href={`/application/${app.id}`}>← Application</Link>
      </p>
      <InterviewWindow
        startIso={new Date(startMs).toISOString()}
        endIso={new Date(endMs).toISOString()}
        durationMinutes={app.interviewDurationMinutes}
        note={app.interviewNote}
        closed={closed}
        hasTranscript={messageCount > 0}
      >
        <InterviewRoom
          wsPath={`/ws-app/${app.id}/interview`}
          me={{ kind: "applicant" }}
          closed={closed}
          emptyHint="When the interview starts, you and Athion will be here."
        />
      </InterviewWindow>
    </>
  );
}

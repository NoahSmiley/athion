import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, chatChannels, inviteCodes } from "@/lib/db/schema";
import { ApplicationActions } from "./actions";
import { InterviewRoom } from "@/app/(main)/application/[id]/interview-room";
import { getCurrentUser } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_review: "In review",
  interview_scheduled: "Interview scheduled",
  needs_more_info: "Needs more info",
  approved: "Approved",
  denied: "Denied",
  withdrawn: "Withdrawn",
};

export default async function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const me = await getCurrentUser();
  const rows = await db.select().from(accessRequests).where(eq(accessRequests.id, id)).limit(1);
  const app = rows[0];
  if (!app) notFound();

  // Mark this conversation as seen by the admin viewing it.
  await db
    .update(accessRequests)
    .set({ lastAdminSeenAt: new Date() })
    .where(eq(accessRequests.id, app.id));

  let code: string | null = null;
  if (app.inviteCodeId) {
    const codeRows = await db.select({ code: inviteCodes.code }).from(inviteCodes).where(eq(inviteCodes.id, app.inviteCodeId)).limit(1);
    code = codeRows[0]?.code ?? null;
  }

  const channelRows = await db
    .select({ slug: chatChannels.slug, kind: chatChannels.kind, closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(eq(chatChannels.applicationId, app.id));
  const appChannel = channelRows.find((c) => c.kind === "application") ?? null;
  const interviewChannel = channelRows.find((c) => c.kind === "interview") ?? null;

  // Interview window for badge rendering
  const now = Date.now();
  const startMs = app.interviewAt ? new Date(app.interviewAt).getTime() : null;
  const endMs = startMs ? startMs + app.interviewDurationMinutes * 60 * 1000 : null;
  const interviewLive = !!(startMs && endMs && now >= startMs && now <= endMs && interviewChannel && !interviewChannel.closedAt);

  return (
    <>
      <h1>Application</h1>
      <p className="muted"><a href="/admin/applications">← All applications</a></p>

      <h2>Details</h2>
      <table>
        <tbody>
          <tr><td className="muted">Email</td><td>{app.email}</td></tr>
          <tr>
            <td className="muted">GitHub</td>
            <td>
              {app.githubUrl ? <a href={app.githubUrl.startsWith("http") ? app.githubUrl : `https://github.com/${app.githubUrl.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">{app.githubUrl}</a> : "—"}
            </td>
          </tr>
          <tr><td className="muted">Vouchers</td><td>{app.vouchers ?? "—"}</td></tr>
          <tr><td className="muted">Status</td><td><b>{STATUS_LABEL[app.status] ?? app.status}</b></td></tr>
          <tr><td className="muted">Submitted</td><td>{new Date(app.createdAt).toLocaleString()}</td></tr>
          {app.reviewedAt && <tr><td className="muted">Reviewed</td><td>{new Date(app.reviewedAt).toLocaleString()}</td></tr>}
          {app.interviewAt && <tr><td className="muted">Interview at</td><td>{new Date(app.interviewAt).toLocaleString()}</td></tr>}
          {code && <tr><td className="muted">Invite code</td><td style={{ fontFamily: "var(--font-mono)" }}>{code}</td></tr>}
        </tbody>
      </table>

      {app.interviewNote && (
        <>
          <h2>Interview note</h2>
          <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{app.interviewNote}</p>
        </>
      )}

      {app.decisionNote && (
        <>
          <h2>Decision note</h2>
          <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{app.decisionNote}</p>
        </>
      )}

      <h2 style={{ marginTop: 24 }}>Application messages</h2>
      <p className="muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 8 }}>
        Async thread for clarifying questions. Applicants only see this thread when the application is in &ldquo;Needs more info&rdquo;.
      </p>
      {appChannel && me ? (
        <InterviewRoom
          wsPath={`/ws/${appChannel.slug}`}
          me={{ kind: "member", memberId: me.id }}
          closed={!!appChannel.closedAt}
          emptyHint="No messages yet."
        />
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          Messages open up when the application moves to In Review.
        </p>
      )}

      <h2 style={{ marginTop: 32 }}>
        Interview {interviewLive && <span style={{ color: "#c8c8c8", fontSize: 11, marginLeft: 8 }}>● live</span>}
      </h2>
      {interviewChannel && me && app.interviewAt ? (
        <>
          <p className="muted" style={{ fontSize: 12, marginTop: -4, marginBottom: 8 }}>
            {new Date(app.interviewAt).toLocaleString()} · {app.interviewDurationMinutes} min
            {!interviewLive && !interviewChannel.closedAt && " · waiting for the scheduled time"}
            {interviewChannel.closedAt && " · closed"}
          </p>
          <InterviewRoom
            wsPath={`/ws/${interviewChannel.slug}`}
            me={{ kind: "member", memberId: me.id }}
            closed={!!interviewChannel.closedAt || !interviewLive}
            emptyHint={interviewLive ? "The interview is live. Begin." : "The chat opens at the scheduled time."}
          />
        </>
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          No interview scheduled. Use the Schedule interview action below.
        </p>
      )}

      <h2 style={{ marginTop: 24 }}>Actions</h2>
      <ApplicationActions
        id={app.id}
        status={app.status}
        isFounder={me?.role === "founder"}
        currentInterviewAt={app.interviewAt ? new Date(app.interviewAt).toISOString() : null}
        currentInterviewDurationMinutes={app.interviewDurationMinutes}
        currentInterviewNote={app.interviewNote ?? null}
      />

      <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
        Public status page: <a href={`/application/${app.id}`} target="_blank">/application/{app.id}</a>
      </p>
    </>
  );
}

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, chatChannels, inviteCodes } from "@/lib/db/schema";
import { ApplicationActions } from "./actions";
import { InterviewRoom } from "@/app/(main)/application/[id]/interview-room";
import { getCurrentUser } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

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
    .select({ slug: chatChannels.slug, closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(eq(chatChannels.applicationId, app.id))
    .limit(1);
  const channel = channelRows[0] ?? null;

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
          <tr><td className="muted">Status</td><td><b>{app.status}</b></td></tr>
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

      <h2 style={{ marginTop: 24 }}>Interview chat</h2>
      {channel && me ? (
        <InterviewRoom
          wsPath={`/ws/${channel.slug}`}
          me={{ kind: "member", memberId: me.id }}
          closed={!!channel.closedAt}
          emptyHint="Start the conversation. Messages here are visible to the applicant in real time."
        />
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          The interview chat is created when you mark the application In Review. Click the button below to do that.
        </p>
      )}

      <h2 style={{ marginTop: 24 }}>Actions</h2>
      <ApplicationActions id={app.id} status={app.status} isFounder={me?.role === "founder"} />

      <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
        Public status page: <a href={`/application/${app.id}`} target="_blank">/application/{app.id}</a>
      </p>
    </>
  );
}

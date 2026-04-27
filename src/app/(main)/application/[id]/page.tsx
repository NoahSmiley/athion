import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, chatChannels, inviteCodes } from "@/lib/db/schema";
import { Stepper } from "./stepper";
import { InterviewRoom } from "./interview-room";
import { WithdrawForm } from "./withdraw-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application status",
  robots: { index: false, follow: false },
};

const STEPS = [
  { key: "received", label: "Received" },
  { key: "reviewing", label: "Reviewing" },
  { key: "decision", label: "Decision" },
];

function stepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "in_review" || status === "interview_scheduled" || status === "needs_more_info") return 1;
  if (status === "approved" || status === "denied" || status === "withdrawn") return 2;
  return 0;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const rows = await db.select().from(accessRequests).where(eq(accessRequests.id, id)).limit(1);
  const app = rows[0];
  if (!app) notFound();

  let code: { code: string; expiresAt: Date | null } | null = null;
  if (app.status === "approved" && app.inviteCodeId) {
    const codeRows = await db
      .select({ code: inviteCodes.code, expiresAt: inviteCodes.expiresAt })
      .from(inviteCodes)
      .where(eq(inviteCodes.id, app.inviteCodeId))
      .limit(1);
    code = codeRows[0] ?? null;
  }

  // Interview channel — created by admin when status moves out of pending
  const channelRows = await db
    .select({ id: chatChannels.id, closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(eq(chatChannels.applicationId, app.id))
    .limit(1);
  const channel = channelRows[0] ?? null;

  const current = stepIndex(app.status);
  const denied = app.status === "denied" || app.status === "withdrawn";
  const approved = app.status === "approved";
  const closed = denied || approved;

  return (
    <>
      <h1>Your application</h1>
      <p className="muted">Submitted {new Date(app.createdAt).toLocaleDateString()} for {app.email}</p>

      <Stepper steps={STEPS} current={current} approved={approved} denied={denied} />

      {app.status === "needs_more_info" && (
        <div style={{ marginTop: 12, padding: "10px 12px", background: "#0a0a0a", border: "1px solid #2a2a2a", fontSize: 13 }}>
          <b>We need a bit more info.</b>
          {app.interviewNote && (
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{app.interviewNote}</p>
          )}
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>Reply in the chat below — we&apos;ll keep going once you do.</p>
        </div>
      )}

      <h2>Interview</h2>
      {channel ? (
        <InterviewRoom
          wsPath={`/ws-app/${app.id}`}
          me={{ kind: "applicant" }}
          closed={!!channel.closedAt}
          emptyHint="Athion will start the conversation here. We respond within a few days."
        />
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          The interview chat opens here once your application moves into review. Check back, or watch your email for an update.
        </p>
      )}

      {approved && code && (
        <>
          <h2>You&apos;re in</h2>
          <p>Welcome. Your invite code:</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, padding: "8px 12px", background: "#111", border: "1px solid #2a2a2a", display: "inline-block" }}>
            {code.code}
          </p>
          <p style={{ marginTop: 8 }}>
            <a href={`/signup?code=${code.code}`} style={{ display: "inline-block", padding: "8px 14px", background: "#fff", color: "#060606", fontWeight: 500, textDecoration: "none" }}>
              Create your account →
            </a>
          </p>
          {app.decisionNote && (
            <p className="muted" style={{ whiteSpace: "pre-wrap", marginTop: 12, fontSize: 12 }}>{app.decisionNote}</p>
          )}
          {code.expiresAt && (
            <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Code expires {new Date(code.expiresAt).toLocaleDateString()}.</p>
          )}
        </>
      )}

      {app.status === "denied" && app.decisionNote && (
        <>
          <h2>Note</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{app.decisionNote}</p>
        </>
      )}

      {app.status === "withdrawn" && (
        <p className="muted" style={{ marginTop: 16, fontSize: 12 }}>You withdrew this application.</p>
      )}

      {!closed && app.status !== "pending" && (
        <p style={{ marginTop: 24, fontSize: 12 }}>
          <WithdrawForm applicationId={app.id} />
        </p>
      )}

      <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
        Bookmark this page. Status updates here as your application progresses. Application id: <code>{app.id}</code>
      </p>
    </>
  );
}

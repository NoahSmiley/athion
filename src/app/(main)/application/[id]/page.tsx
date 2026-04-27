import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
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

  // Application channel — always-on async messages with the team.
  // Interview channel — only relevant when an interview is scheduled.
  const appChannelRows = await db
    .select({ id: chatChannels.id, closedAt: chatChannels.closedAt })
    .from(chatChannels)
    .where(and(eq(chatChannels.applicationId, app.id), eq(chatChannels.kind, "application")))
    .limit(1);
  const appChannel = appChannelRows[0] ?? null;

  const current = stepIndex(app.status);
  const denied = app.status === "denied" || app.status === "withdrawn";
  const approved = app.status === "approved";
  const closed = denied || approved;

  // Interview window times (used to decide what to show)
  const now = Date.now();
  const interviewStart = app.interviewAt ? new Date(app.interviewAt).getTime() : null;
  const interviewEnd = interviewStart ? interviewStart + app.interviewDurationMinutes * 60 * 1000 : null;
  const interviewLive = !!(interviewStart && interviewEnd && now >= interviewStart && now <= interviewEnd && !closed);
  const interviewUpcoming = !!(interviewStart && now < interviewStart && !closed);

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
          <p className="muted" style={{ margin: "6px 0 0", fontSize: 12 }}>Reply in the messages below — we&apos;ll keep going once you do.</p>
        </div>
      )}

      {app.status === "interview_scheduled" && interviewStart && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#0a0a0a", border: "1px solid", borderColor: interviewLive ? "#c8c8c8" : "#2a2a2a", fontSize: 13 }}>
          {interviewLive ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}><b>● Interview is live</b></p>
              <p className="muted" style={{ margin: "4px 0 8px", fontSize: 12 }}>
                Until {new Date(interviewEnd!).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
              </p>
              <p style={{ margin: 0 }}>
                <Link href={`/application/${app.id}/interview`} style={{ display: "inline-block", padding: "8px 14px", background: "#fff", color: "#060606", fontWeight: 500, textDecoration: "none" }}>
                  Join interview →
                </Link>
              </p>
            </>
          ) : interviewUpcoming ? (
            <>
              <p style={{ margin: 0, fontSize: 14 }}><b>Interview scheduled</b></p>
              <p style={{ margin: "4px 0 0" }}>
                {new Date(interviewStart).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                <span className="muted"> · {app.interviewDurationMinutes} min</span>
              </p>
              {app.interviewNote && <p className="muted" style={{ margin: "8px 0 8px", whiteSpace: "pre-wrap" }}>{app.interviewNote}</p>}
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                The interview happens at <Link href={`/application/${app.id}/interview`}>this link</Link> at the scheduled time.
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 14 }}><b>Interview complete</b></p>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                {new Date(interviewStart).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
                <span> · awaiting decision</span>
              </p>
            </>
          )}
        </div>
      )}

      {app.status === "needs_more_info" && appChannel && (
        <>
          <h2>Messages</h2>
          <InterviewRoom
            wsPath={`/ws-app/${app.id}/application`}
            me={{ kind: "applicant" }}
            closed={!!appChannel.closedAt}
            emptyHint="Reply here with the info we asked for."
          />
        </>
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

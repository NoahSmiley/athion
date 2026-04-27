import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, inviteCodes } from "@/lib/db/schema";
import { Stepper } from "./stepper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application status",
  robots: { index: false, follow: false },
};

const STEPS = [
  { key: "received", label: "Received" },
  { key: "in_review", label: "In review" },
  { key: "interview", label: "Interview" },
  { key: "decision", label: "Decision" },
];

function stepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "in_review") return 1;
  if (status === "interview_scheduled") return 2;
  if (status === "approved" || status === "denied") return 3;
  return 0;
}

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  const current = stepIndex(app.status);
  const denied = app.status === "denied";
  const approved = app.status === "approved";

  return (
    <>
      <h1>Your application</h1>
      <p className="muted">Submitted {new Date(app.createdAt).toLocaleDateString()} for {app.email}</p>

      <Stepper steps={STEPS} current={current} approved={approved} denied={denied} />

      {app.status === "interview_scheduled" && (
        <>
          <h2>Interview details</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {app.interviewNote ?? "Interview scheduled. We'll be in touch."}
          </p>
          {app.interviewAt && (
            <p className="muted" style={{ fontSize: 12 }}>When: {new Date(app.interviewAt).toLocaleString()}</p>
          )}
        </>
      )}

      {approved && code && (
        <>
          <h2>Welcome to Athion</h2>
          <p>Your invite code:</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, padding: "8px 12px", background: "#111", border: "1px solid #2a2a2a", display: "inline-block" }}>
            {code.code}
          </p>
          <p className="muted" style={{ fontSize: 12 }}>
            Use it at <a href={`/signup?code=${code.code}`}>/signup</a>{code.expiresAt ? `. Expires ${new Date(code.expiresAt).toLocaleDateString()}.` : "."}
          </p>
        </>
      )}

      {denied && app.decisionNote && (
        <>
          <h2>Note</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{app.decisionNote}</p>
        </>
      )}

      <p className="muted" style={{ marginTop: 24, fontSize: 11 }}>
        Bookmark this page. Status updates here as your application progresses. Application id: <code>{app.id}</code>
      </p>
    </>
  );
}

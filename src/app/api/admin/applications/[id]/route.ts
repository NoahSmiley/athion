import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { accessRequests, inviteCodes } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";
import {
  sendMail,
  applicationInReviewEmail,
  interviewScheduledEmail,
  approvedEmail,
  deniedEmail,
} from "@/lib/mail";
import { ensureInterviewChannel, closeInterviewChannel } from "@/lib/interview";

const INVITE_CODE_TTL_DAYS = 14;

function generateCode() {
  // 12-char URL-safe code
  return crypto.randomBytes(9).toString("base64url");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json();
  const action = body.action as string;

  const rows = await db.select().from(accessRequests).where(eq(accessRequests.id, id)).limit(1);
  const app = rows[0];
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Founder-only reopen of closed applications. Resets status to in_review and
  // re-opens the interview channel if it exists.
  if (action === "reopen") {
    if (admin.role !== "founder") {
      return NextResponse.json({ error: "Founder only" }, { status: 403 });
    }
    if (app.status === "approved") {
      return NextResponse.json({ error: "Approved applications can't be reopened" }, { status: 409 });
    }
    await db.update(accessRequests)
      .set({ status: "in_review", reviewedAt: null, reviewedBy: null, decisionNote: null })
      .where(eq(accessRequests.id, id));
    await ensureInterviewChannel(id);
    // Reopen the channel by clearing closed_at
    const { chatChannels } = await import("@/lib/db/schema");
    await db.update(chatChannels).set({ closedAt: null }).where(eq(chatChannels.applicationId, id));
    return NextResponse.json({ ok: true });
  }

  const closedStatuses = new Set(["approved", "denied", "withdrawn"]);
  if (closedStatuses.has(app.status)) {
    return NextResponse.json({ error: "Application already closed" }, { status: 409 });
  }

  if (action === "mark_in_review") {
    await db.update(accessRequests).set({ status: "in_review" }).where(eq(accessRequests.id, id));
    await ensureInterviewChannel(id);
    void sendMail({ to: app.email, ...applicationInReviewEmail(id) });
    return NextResponse.json({ ok: true });
  }

  if (action === "schedule_interview") {
    const interviewAt = body.interviewAt ? new Date(body.interviewAt) : null;
    if (interviewAt && Number.isNaN(interviewAt.getTime())) {
      return NextResponse.json({ error: "Invalid interview datetime" }, { status: 400 });
    }
    const interviewNote = body.interviewNote ? String(body.interviewNote).trim() : "";
    if (!interviewNote) return NextResponse.json({ error: "Interview note required" }, { status: 400 });
    await db.update(accessRequests)
      .set({ status: "interview_scheduled", interviewAt, interviewNote })
      .where(eq(accessRequests.id, id));
    await ensureInterviewChannel(id);
    void sendMail({ to: app.email, ...interviewScheduledEmail(id, interviewNote, interviewAt) });
    return NextResponse.json({ ok: true });
  }

  if (action === "request_more_info") {
    const note = body.note ? String(body.note).trim() : "";
    if (!note) {
      return NextResponse.json({ error: "Note required — tell the applicant what info you need" }, { status: 400 });
    }
    await db.update(accessRequests)
      .set({ status: "needs_more_info", interviewNote: note })
      .where(eq(accessRequests.id, id));
    await ensureInterviewChannel(id);
    return NextResponse.json({ ok: true });
  }

  if (action === "approve") {
    const decisionNote = body.decisionNote ? String(body.decisionNote) : null;
    const code = generateCode();
    const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const insertedCode = await db.insert(inviteCodes).values({
      code,
      issuedBy: admin.id,
      expiresAt,
    }).returning({ id: inviteCodes.id });

    await db.update(accessRequests)
      .set({
        status: "approved",
        decisionNote,
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        inviteCodeId: insertedCode[0].id,
      })
      .where(eq(accessRequests.id, id));

    await closeInterviewChannel(id);
    void sendMail({ to: app.email, ...approvedEmail(id, code, expiresAt) });
    return NextResponse.json({ ok: true, code });
  }

  if (action === "deny") {
    const decisionNote = body.decisionNote ? String(body.decisionNote) : null;
    await db.update(accessRequests)
      .set({
        status: "denied",
        decisionNote,
        reviewedAt: new Date(),
        reviewedBy: admin.id,
      })
      .where(eq(accessRequests.id, id));
    await closeInterviewChannel(id);
    void sendMail({ to: app.email, ...deniedEmail(id, decisionNote) });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

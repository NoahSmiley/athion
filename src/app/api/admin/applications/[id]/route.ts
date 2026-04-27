import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { accessRequests, inviteCodes } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";

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
  const body = await request.json();
  const action = body.action as string;

  const rows = await db.select().from(accessRequests).where(eq(accessRequests.id, id)).limit(1);
  const app = rows[0];
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status === "approved" || app.status === "denied") {
    return NextResponse.json({ error: "Application already closed" }, { status: 409 });
  }

  if (action === "mark_in_review") {
    await db.update(accessRequests).set({ status: "in_review" }).where(eq(accessRequests.id, id));
    return NextResponse.json({ ok: true });
  }

  if (action === "schedule_interview") {
    const interviewAt = body.interviewAt ? new Date(body.interviewAt) : null;
    const interviewNote = body.interviewNote ? String(body.interviewNote) : null;
    if (!interviewNote) return NextResponse.json({ error: "Interview note required" }, { status: 400 });
    await db.update(accessRequests)
      .set({ status: "interview_scheduled", interviewAt, interviewNote })
      .where(eq(accessRequests.id, id));
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
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

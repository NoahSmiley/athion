import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests, applicationMessages } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";

const MAX_BODY = 4000;
const MIN_BODY = 1;

// GET — anyone with the application UUID can read the thread
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const exists = await db
    .select({ id: accessRequests.id })
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);
  if (exists.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await db
    .select({
      id: applicationMessages.id,
      authorRole: applicationMessages.authorRole,
      authorName: applicationMessages.authorName,
      body: applicationMessages.body,
      createdAt: applicationMessages.createdAt,
    })
    .from(applicationMessages)
    .where(eq(applicationMessages.applicationId, id))
    .orderBy(asc(applicationMessages.createdAt));

  return NextResponse.json({ messages });
}

// POST — either the applicant (no auth) or an admin (auth) can post.
// If the caller has admin auth, the message is recorded as admin/founder; otherwise applicant.
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (text.length < MIN_BODY || text.length > MAX_BODY) {
    return NextResponse.json({ error: `Message must be ${MIN_BODY}\u2013${MAX_BODY} characters` }, { status: 400 });
  }

  const apps = await db
    .select({ id: accessRequests.id, status: accessRequests.status })
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);
  const app = apps[0];
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status === "approved" || app.status === "denied") {
    return NextResponse.json({ error: "Application is closed" }, { status: 409 });
  }

  // If the caller is an admin, record their identity. Otherwise treat as applicant.
  const admin = await getAdminUser();
  const inserted = await db
    .insert(applicationMessages)
    .values({
      applicationId: id,
      authorId: admin?.id ?? null,
      authorRole: admin?.role ?? "applicant",
      authorName: admin?.displayName ?? null,
      body: text,
    })
    .returning({ id: applicationMessages.id });

  // Side effect: when a non-staff applicant replies, bump the status from
  // interview_scheduled back to interview-active so admin sees there's something to read.
  // (We don't change `pending` -> something; that's the admin's call.)
  if (!admin && app.status === "pending") {
    // applicant replied before any review — still pending, no change
  }

  return NextResponse.json({ id: inserted[0].id }, { status: 201 });
}

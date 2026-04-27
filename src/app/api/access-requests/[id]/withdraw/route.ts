import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { closeApplicationChannels } from "@/lib/interview";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rows = await db
    .select({ id: accessRequests.id, status: accessRequests.status })
    .from(accessRequests)
    .where(eq(accessRequests.id, id))
    .limit(1);
  const app = rows[0];
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status === "approved" || app.status === "denied" || app.status === "withdrawn") {
    return NextResponse.json({ error: "Application already closed" }, { status: 409 });
  }

  await db
    .update(accessRequests)
    .set({ status: "withdrawn", reviewedAt: new Date() })
    .where(eq(accessRequests.id, id));
  await closeApplicationChannels(id);

  return NextResponse.json({ ok: true });
}

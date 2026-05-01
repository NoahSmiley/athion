import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opendockReleases } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (typeof body.yanked !== "boolean") return NextResponse.json({ error: "Bad body" }, { status: 400 });

  const updated = await db.update(opendockReleases).set({ yanked: body.yanked }).where(eq(opendockReleases.id, id)).returning();
  if (updated.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, yanked: updated[0].yanked });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade deletes artifacts (FK ON DELETE CASCADE). Files on disk are not removed —
  // the admin removes them via SCP if needed.
  const deleted = await db.delete(opendockReleases).where(eq(opendockReleases.id, id)).returning();
  if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

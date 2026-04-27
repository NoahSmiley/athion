import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getFounderUser } from "@/lib/auth/roles";

const ALLOWED_ROLES = new Set(["founder", "admin", "member"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const founder = await getFounderUser();
  if (!founder) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  const role = body?.role;
  if (!role || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Verify the target user exists — Drizzle update is a no-op on missing rows,
  // so without this check we'd return ok for any random UUID.
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Don't let the last founder demote themselves
  if (founder.id === id && role !== "founder") {
    const founderCount = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "founder"));
    if (founderCount.length <= 1) {
      return NextResponse.json({ error: "Can't demote the only founder" }, { status: 409 });
    }
  }

  await db.update(users).set({ role }).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}

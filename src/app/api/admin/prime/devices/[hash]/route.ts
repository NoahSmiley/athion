import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDevices } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";

/**
 * Admin control over one activated TV. `revoked: true` is the kill switch
 * (the TV's next renew gets 410 and it returns to pairing); `revoked: false`
 * reinstates it; `label` names the TV in the list. DELETE forgets the row
 * entirely — the TV can never renew again and the audit trail is gone, so
 * prefer revoke.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ hash: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { hash } = await context.params;
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: { revokedAt?: Date | null; label?: string | null } = {};
  if (typeof body.revoked === "boolean") patch.revokedAt = body.revoked ? new Date() : null;
  if (typeof body.label === "string") patch.label = body.label.trim().slice(0, 64) || null;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to change" }, { status: 400 });
  }

  const existing = await db
    .select({ tokenHash: primeDevices.tokenHash })
    .from(primeDevices)
    .where(eq(primeDevices.tokenHash, hash))
    .limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.update(primeDevices).set(patch).where(eq(primeDevices.tokenHash, hash));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ hash: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { hash } = await context.params;
  if (!/^[0-9a-f]{64}$/.test(hash)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.delete(primeDevices).where(eq(primeDevices.tokenHash, hash));
  return NextResponse.json({ ok: true });
}

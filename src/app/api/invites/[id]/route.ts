import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inviteCodes, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/roles";
import { isUnlimited } from "@/lib/invites";

// DELETE /api/invites/[id] — revoke an unused code. Refunds the issuer's budget
// (unless they're unlimited, in which case there's nothing to refund).
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;

  const rows = await db
    .select({
      id: inviteCodes.id,
      issuedBy: inviteCodes.issuedBy,
      usedAt: inviteCodes.usedAt,
      revokedAt: inviteCodes.revokedAt,
    })
    .from(inviteCodes)
    .where(eq(inviteCodes.id, id))
    .limit(1);
  const code = rows[0];
  if (!code) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (code.issuedBy !== me.id) return NextResponse.json({ error: "Not yours" }, { status: 403 });
  if (code.usedAt) return NextResponse.json({ error: "Already used" }, { status: 409 });
  if (code.revokedAt) return NextResponse.json({ error: "Already revoked" }, { status: 409 });

  await db
    .update(inviteCodes)
    .set({ revokedAt: new Date() })
    .where(eq(inviteCodes.id, id));

  // Refund the budget if they're not unlimited
  if (!isUnlimited(me.role)) {
    const u = await db
      .select({ invitesAvailable: users.invitesAvailable })
      .from(users)
      .where(eq(users.id, me.id))
      .limit(1);
    const cur = u[0]?.invitesAvailable ?? 0;
    await db
      .update(users)
      .set({ invitesAvailable: cur + 1 })
      .where(eq(users.id, me.id));
  }

  return NextResponse.json({ ok: true });
}

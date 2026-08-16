import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inviteCodes } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const me = await getAdminUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

  return NextResponse.json({ ok: true });
}

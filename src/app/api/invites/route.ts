import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { inviteCodes, users } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";
import { generateCode, INVITE_CODE_TTL_DAYS } from "@/lib/invites";

export async function GET() {
  const me = await getAdminUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const myCodes = await db
    .select({
      id: inviteCodes.id,
      code: inviteCodes.code,
      usedAt: inviteCodes.usedAt,
      usedBy: inviteCodes.usedBy,
      revokedAt: inviteCodes.revokedAt,
      expiresAt: inviteCodes.expiresAt,
      createdAt: inviteCodes.createdAt,
    })
    .from(inviteCodes)
    .where(eq(inviteCodes.issuedBy, me.id))
    .orderBy(desc(inviteCodes.createdAt))
    .limit(50);

  const usedByIds = myCodes.map((c) => c.usedBy).filter((x): x is string => !!x);
  const usedByUsers =
    usedByIds.length === 0
      ? []
      : await db
          .select({ id: users.id, username: users.username, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, usedByIds));

  const usersById = new Map(usedByUsers.map((u) => [u.id, u]));

  return NextResponse.json({
    codes: myCodes.map((c) => ({
      ...c,
      usedByUser: c.usedBy ? usersById.get(c.usedBy) ?? null : null,
    })),
  });
}

export async function POST() {
  const me = await getAdminUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const inserted = await db
    .insert(inviteCodes)
    .values({ code, issuedBy: me.id, expiresAt })
    .returning({ id: inviteCodes.id, code: inviteCodes.code, expiresAt: inviteCodes.expiresAt });

  return NextResponse.json({ code: inserted[0] }, { status: 201 });
}

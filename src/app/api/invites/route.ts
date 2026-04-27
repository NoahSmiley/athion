import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { inviteCodes, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/roles";
import { generateCode, INVITE_CODE_TTL_DAYS, isUnlimited, refreshInvites } from "@/lib/invites";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const state = await refreshInvites(me.id);

  // Codes I've issued — both active (no usedAt, not revoked, not expired) and historical
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
          .select({ id: users.id, username: users.username, memberNumber: users.memberNumber, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, usedByIds));

  const usersById = new Map(usedByUsers.map((u) => [u.id, u]));

  return NextResponse.json({
    state,
    codes: myCodes.map((c) => ({
      ...c,
      usedByUser: c.usedBy ? usersById.get(c.usedBy) ?? null : null,
    })),
  });
}

export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const state = await refreshInvites(me.id);

  if (!state.unlimited) {
    if (state.cooldownActive) {
      return NextResponse.json(
        { error: `Cooldown active until ${state.cooldownUntil!.toLocaleDateString()}` },
        { status: 403 },
      );
    }
    if (state.available <= 0) {
      return NextResponse.json({ error: "No invites available" }, { status: 403 });
    }
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const inserted = await db
    .insert(inviteCodes)
    .values({ code, issuedBy: me.id, expiresAt })
    .returning({ id: inviteCodes.id, code: inviteCodes.code, expiresAt: inviteCodes.expiresAt });

  if (!isUnlimited(me.role)) {
    await db
      .update(users)
      .set({ invitesAvailable: state.available - 1 })
      .where(eq(users.id, me.id));
  }

  return NextResponse.json({ code: inserted[0] }, { status: 201 });
}

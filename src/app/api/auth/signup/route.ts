import { NextResponse } from "next/server";
import { and, eq, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, inviteCodes } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { pickUniqueUsername } from "@/lib/username";

export async function POST(request: Request) {
  try {
    const { email, password, displayName, inviteCode } = await request.json();

    if (!email || !password || !inviteCode) {
      return NextResponse.json({ error: "Email, password, and invite code are required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const codes = await db
      .select()
      .from(inviteCodes)
      .where(and(
        eq(inviteCodes.code, inviteCode),
        isNull(inviteCodes.usedAt),
        isNull(inviteCodes.revokedAt),
        gt(inviteCodes.expiresAt, new Date()),
      ))
      .limit(1);
    const code = codes[0];
    if (!code) {
      return NextResponse.json({ error: "Invalid, expired, or already-used invite code" }, { status: 403 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const usernameBase = displayName ? String(displayName) : normalizedEmail.split("@")[0];
    const username = await pickUniqueUsername(usernameBase);

    const cooldownUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const inserted = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        displayName: displayName || null,
        username,
        invitedBy: code.issuedBy,
        joinCooldownUntil: cooldownUntil,
      })
      .returning();
    const user = inserted[0];

    await db
      .update(inviteCodes)
      .set({ usedBy: user.id, usedAt: new Date() })
      .where(eq(inviteCodes.id, code.id));

    const token = await signToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        memberNumber: user.memberNumber,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

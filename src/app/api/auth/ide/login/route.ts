import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { users, ideAuthCodes } from "@/lib/db/schema";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  const { email, password, code } = await request.json();

  if (!email || !password || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the auth code exists and hasn't expired
  const [authCode] = await db
    .select()
    .from(ideAuthCodes)
    .where(
      and(
        eq(ideAuthCodes.code, code),
        gt(ideAuthCodes.expiresAt, new Date()),
      )
    )
    .limit(1);

  if (!authCode) {
    return NextResponse.json({ error: "Login link expired. Please try again from the IDE." }, { status: 410 });
  }

  // Authenticate user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Stamp the auth code with a JWT so the IDE can pick it up via polling
  const token = await signToken(user.id);
  await db
    .update(ideAuthCodes)
    .set({ userId: user.id, token })
    .where(eq(ideAuthCodes.id, authCode.id));

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function tooManyAttempts(retryAfterMs: number) {
  return NextResponse.json(
    { error: "Too many login attempts. Try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))) },
    },
  );
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipLimit = checkRateLimit(`login:ip:${clientIp(request)}`, 10, LOGIN_WINDOW_MS);
    const accountLimit = checkRateLimit(`login:account:${normalizedEmail}`, 25, LOGIN_WINDOW_MS);
    if (!ipLimit.ok || !accountLimit.ok) {
      return tooManyAttempts(Math.max(ipLimit.retryAfterMs, accountLimit.retryAfterMs));
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

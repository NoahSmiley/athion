import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { sendMail, passwordResetEmail } from "@/lib/mail";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ipLimit = checkRateLimit(`password-reset:ip:${clientIp(request)}`, 10, RESET_RATE_WINDOW_MS);
    const accountLimit = checkRateLimit(`password-reset:account:${normalizedEmail}`, 3, RESET_RATE_WINDOW_MS);
    if (!ipLimit.ok || !accountLimit.ok) {
      const retryAfterMs = Math.max(ipLimit.retryAfterMs, accountLimit.retryAfterMs);
      return NextResponse.json(
        { error: "Too many reset requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))) },
        },
      );
    }

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Always return success to avoid leaking which emails are registered.
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await sendMail({ to: user.email, ...passwordResetEmail(token) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

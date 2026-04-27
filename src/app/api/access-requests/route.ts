import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";
import { sendMail, applicationReceivedEmail } from "@/lib/mail";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const REAPPLY_COOLDOWN_DAYS = 30;
const RATE_LIMIT_MAX = 5; // per IP
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    // Validate body before any side-effecting work
    const body = await request.json().catch(() => null);
    const email = body?.email;
    const github = body?.github;
    const vouchers = body?.vouchers;

    if (!email || !github) {
      return NextResponse.json({ error: "Email and GitHub are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Look at the most recent application from this email
    const recent = await db
      .select({
        id: accessRequests.id,
        status: accessRequests.status,
        reviewedAt: accessRequests.reviewedAt,
      })
      .from(accessRequests)
      .where(eq(accessRequests.email, normalizedEmail))
      .orderBy(desc(accessRequests.createdAt))
      .limit(1);
    const last = recent[0];

    if (last) {
      // Open-state — return their existing application instead of creating a duplicate.
      // Don't count this against the rate limit (it's not a new submission).
      const open = ["pending", "in_review", "interview_scheduled", "needs_more_info"];
      if (open.includes(last.status)) {
        return NextResponse.json({ id: last.id }, { status: 200 });
      }
      // Already approved
      if (last.status === "approved") {
        return NextResponse.json({ error: "You already have an account. Try /login." }, { status: 409 });
      }
      // Recently denied — block re-apply for the cooldown window
      if (last.status === "denied" && last.reviewedAt) {
        const cooldownEnds = new Date(last.reviewedAt.getTime() + REAPPLY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
        if (cooldownEnds.getTime() > Date.now()) {
          return NextResponse.json(
            { error: `Please wait until ${cooldownEnds.toLocaleDateString()} before applying again.` },
            { status: 429 },
          );
        }
      }
      // withdrawn or denied past cooldown: allow new submission below
    }

    // Rate limit only when we're actually about to create a new application.
    // (Validation failures, dedup hits, and cooldown rejections don't burn quota.)
    const ip = clientIp(request);
    const rl = checkRateLimit(`apply:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rl.ok) {
      const retryMin = Math.ceil(rl.retryAfterMs / 60000);
      return NextResponse.json(
        { error: `Too many applications from your network. Try again in ${retryMin} minutes.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
      );
    }

    const inserted = await db
      .insert(accessRequests)
      .values({
        email: normalizedEmail,
        githubUrl: String(github).trim(),
        vouchers: vouchers ? String(vouchers).trim() : null,
        status: "pending",
      })
      .returning({ id: accessRequests.id });

    const id = inserted[0].id;
    void sendMail({ to: normalizedEmail, ...applicationReceivedEmail(id) });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDeviceCodes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { ensureUser, issueUserToken, jellyfinPublicUrl } from "@/lib/jellyfin/admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * The phone side: a signed-in member enters the TV's code, we provision
 * their Jellyfin identity and park the TV's full config on the row for its
 * next poll to consume. Live TV credentials ride along when the server has
 * an upstream configured (same env the prime-web proxy uses).
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`device-claim:${clientIp(request)}`, 15, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const me = await getSession();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let code: string;
  try {
    const body = await request.json();
    code = String(body.code ?? "").toUpperCase().trim();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(primeDeviceCodes)
    .where(eq(primeDeviceCodes.code, code))
    .limit(1);

  if (!row || row.expiresAt < new Date()) {
    return NextResponse.json({ error: "code_expired" }, { status: 404 });
  }
  if (row.status !== "pending") {
    return NextResponse.json({ error: "code_already_used" }, { status: 409 });
  }

  const { jellyfinUsername } = await ensureUser(me.id, me.username);
  const deviceId = `prime-tv:${me.id}:${code}`;
  const token = await issueUserToken(me.id, jellyfinUsername, deviceId);

  const config: Record<string, unknown> = {
    memberName: me.displayName ?? me.username ?? me.email,
    jellyfin: {
      url: jellyfinPublicUrl(),
      accessToken: token.accessToken,
      userId: token.userId,
      username: token.username,
      deviceId,
    },
  };
  // Live TV passthrough — present only when this deployment has an upstream.
  if (process.env.XTREAM_BASE_URL && process.env.XTREAM_USERNAME && process.env.XTREAM_PASSWORD) {
    config.xtream = {
      url: process.env.XTREAM_BASE_URL.replace(/\/+$/, ""),
      username: process.env.XTREAM_USERNAME,
      password: process.env.XTREAM_PASSWORD,
    };
  }

  await db
    .update(primeDeviceCodes)
    .set({ status: "claimed", claimedBy: me.id, payload: JSON.stringify(config) })
    .where(eq(primeDeviceCodes.code, code));

  return NextResponse.json({ ok: true, memberName: config.memberName });
}

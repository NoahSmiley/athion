import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDevices, users } from "@/lib/db/schema";
import { buildPrimeConfig } from "@/lib/prime/device-config";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Silent session recovery for an activated TV. The device holds a renewal
 * token from its claim; when its Jellyfin session dies (revoked token,
 * server restore, credential rotation) it trades that token for a fresh
 * config — same shape as activation — with no one touching a remote.
 * Lookup is by sha256 of the token, so the table never holds plaintext.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`device-renew:${clientIp(request)}`, 30, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  let deviceToken: string;
  try {
    const body = await request.json();
    deviceToken = String(body.deviceToken ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!deviceToken) {
    return NextResponse.json({ error: "token_required" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(deviceToken).digest("hex");
  const [row] = await db
    .select({
      tokenHash: primeDevices.tokenHash,
      deviceId: primeDevices.deviceId,
      userId: primeDevices.userId,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
    })
    .from(primeDevices)
    .innerJoin(users, eq(users.id, primeDevices.userId))
    .where(eq(primeDevices.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "unknown_device" }, { status: 401 });
  }

  const config = await buildPrimeConfig(
    { id: row.userId, username: row.username, displayName: row.displayName, email: row.email },
    row.deviceId
  );

  await db
    .update(primeDevices)
    .set({ lastRenewedAt: new Date() })
    .where(eq(primeDevices.tokenHash, tokenHash));

  return NextResponse.json({ status: "renewed", config });
}

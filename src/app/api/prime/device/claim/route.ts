import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDeviceCodes, primeDevices } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { buildPrimeConfig } from "@/lib/prime/device-config";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * The phone side: a signed-in member enters the TV's code, we provision
 * their Jellyfin identity (and their own live-TV credential) and park the
 * TV's full config on the row for its next poll to consume. The payload
 * also carries a long-lived renewal token — hashed here, plaintext only on
 * the TV — so the device can silently re-provision if its session dies.
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

  const deviceId = `prime-tv:${me.id}:${code}`;
  const config = await buildPrimeConfig(me, deviceId);

  const deviceToken = randomBytes(32).toString("base64url");
  await db.insert(primeDevices).values({
    tokenHash: createHash("sha256").update(deviceToken).digest("hex"),
    userId: me.id,
    deviceId,
  });
  config.deviceToken = deviceToken;

  await db
    .update(primeDeviceCodes)
    .set({ status: "claimed", claimedBy: me.id, payload: JSON.stringify(config) })
    .where(eq(primeDeviceCodes.code, code));

  return NextResponse.json({ ok: true, memberName: config.memberName });
}

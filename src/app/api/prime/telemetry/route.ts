import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDevices, primeTelemetry, users } from "@/lib/db/schema";
import { primeFlags } from "@/lib/prime/device-config";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const MAX_EVENTS_PER_POST = 50;
const MAX_MESSAGE_CHARS = 2000;
const RETENTION_DAYS = 14;

/**
 * Error/crash ingest from Prime devices. Family TVs otherwise fail silently
 * — the app batches recent Log.error lines and any crash marker and posts
 * them here, so debugging a member's "it's broken" starts from real
 * messages instead of archaeology. Open by design (dev builds have no
 * device token); rate limits and hard size caps bound the surface.
 *
 * Attribution: when the post carries the device's renewal token, the rows
 * are attributed from the devices table (the member the TV was activated
 * for) rather than whatever name the payload claims, and the device's
 * last-seen clock advances. Dev builds without a token keep the free-text
 * fields.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`prime-telemetry:${clientIp(request)}`, 60, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  let body: {
    deviceId?: unknown;
    deviceToken?: unknown;
    memberName?: unknown;
    appVersion?: unknown;
    events?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let deviceId = typeof body.deviceId === "string" ? body.deviceId.slice(0, 64) : null;
  let memberName = typeof body.memberName === "string" ? body.memberName.slice(0, 64) : null;
  const appVersion = typeof body.appVersion === "string" ? body.appVersion.slice(0, 32) : null;

  if (typeof body.deviceToken === "string" && body.deviceToken.length > 0) {
    const tokenHash = createHash("sha256").update(body.deviceToken).digest("hex");
    const [device] = await db
      .select({
        deviceId: primeDevices.deviceId,
        displayName: users.displayName,
        username: users.username,
        email: users.email,
      })
      .from(primeDevices)
      .innerJoin(users, eq(users.id, primeDevices.userId))
      .where(eq(primeDevices.tokenHash, tokenHash))
      .limit(1);
    if (device) {
      deviceId = device.deviceId;
      memberName = device.displayName ?? device.username ?? device.email;
      await db
        .update(primeDevices)
        .set({ lastSeenAt: new Date() })
        .where(eq(primeDevices.tokenHash, tokenHash));
    }
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS_PER_POST) : [];
  const rows = events.flatMap((event) => {
    if (typeof event !== "object" || event === null) return [];
    const { kind, message } = event as { kind?: unknown; message?: unknown };
    if (typeof message !== "string" || message.length === 0) return [];
    return [
      {
        deviceId,
        memberName,
        appVersion,
        kind: kind === "crash" ? "crash" : "error",
        message: message.slice(0, MAX_MESSAGE_CHARS),
      },
    ];
  });

  if (rows.length > 0) {
    await db.insert(primeTelemetry).values(rows);
  }

  // Opportunistic prune — the table stays a rolling two weeks with no cron.
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(primeTelemetry).where(lt(primeTelemetry.createdAt, cutoff));

  return NextResponse.json({ ok: true, stored: rows.length, flags: primeFlags(appVersion) });
}

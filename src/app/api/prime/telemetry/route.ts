import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeTelemetry } from "@/lib/db/schema";
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
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`prime-telemetry:${clientIp(request)}`, 60, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  let body: {
    deviceId?: unknown;
    memberName?: unknown;
    appVersion?: unknown;
    events?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS_PER_POST) : [];
  const rows = events.flatMap((event) => {
    if (typeof event !== "object" || event === null) return [];
    const { kind, message } = event as { kind?: unknown; message?: unknown };
    if (typeof message !== "string" || message.length === 0) return [];
    return [
      {
        deviceId: typeof body.deviceId === "string" ? body.deviceId.slice(0, 64) : null,
        memberName: typeof body.memberName === "string" ? body.memberName.slice(0, 64) : null,
        appVersion: typeof body.appVersion === "string" ? body.appVersion.slice(0, 32) : null,
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

  return NextResponse.json({ ok: true, stored: rows.length });
}

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDeviceCodes } from "@/lib/db/schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const CODE_TTL_MS = 15 * 60 * 1000;
// Rows older than this are purged on the next mint. A claimed-but-never-
// consumed row carries a live Jellyfin token and a live-TV credential in its
// payload; nothing should keep that on disk past the code's own lifetime.
const PURGE_AFTER_MS = 60 * 60 * 1000;

// No ambiguous glyphs. Read off a TV screen from a couch: 0/O, 1/I/L were
// already out; 2/Z, 5/S, 8/B and U/V go too (Crockford-style).
const ALPHABET = "34679ACDEFGHJKMNPQRTWXY";

function makeCode(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/**
 * A TV starting onboarding calls this, then renders the returned code as a
 * QR of activateUrl and polls /api/prime/device/poll with its pollSecret.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(`device-start:${clientIp(request)}`, 10, CODE_TTL_MS);
  if (!limit.ok) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  // Opportunistic sweep — keeps the table a rolling hour with no cron.
  await db
    .delete(primeDeviceCodes)
    .where(lt(primeDeviceCodes.expiresAt, new Date(Date.now() - PURGE_AFTER_MS)));

  const code = makeCode();
  const pollSecret = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await db.insert(primeDeviceCodes).values({ code, pollSecret, expiresAt });

  return NextResponse.json({
    code,
    pollSecret,
    activateUrl: `https://athion.me/activate?code=${code}`,
    activateHost: "athion.me/activate",
    pollIntervalSeconds: 2,
    expiresInSeconds: Math.floor(CODE_TTL_MS / 1000),
  });
}

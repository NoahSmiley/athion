import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { primeDeviceCodes } from "@/lib/db/schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const CODE_TTL_MS = 15 * 60 * 1000;

// No ambiguous glyphs (0/O, 1/I/L) — this code is read off a TV screen.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

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

  const code = makeCode();
  const pollSecret = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await db.insert(primeDeviceCodes).values({ code, pollSecret, expiresAt });

  return NextResponse.json({
    code,
    pollSecret,
    activateUrl: `https://athion.me/activate?code=${code}`,
    pollIntervalSeconds: 2,
    expiresInSeconds: Math.floor(CODE_TTL_MS / 1000),
  });
}

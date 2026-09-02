import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { primeDeviceCodes } from "@/lib/db/schema";

function secretsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * The TV's poll loop. Pending until the phone claims the code; the first
 * poll after that gets the config payload exactly once (the row is consumed
 * and the payload cleared, so a leaked code can't be re-harvested later).
 *
 * Current builds POST {code, secret} so the secret never sits in a query
 * string (access logs, CDN logs); the GET form stays for TVs still on the
 * first activation build.
 */
async function poll(code: string, secret: string) {
  if (!code || !secret) {
    return NextResponse.json({ error: "missing_params" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(primeDeviceCodes)
    .where(eq(primeDeviceCodes.code, code))
    .limit(1);

  if (!row || !secretsMatch(secret, row.pollSecret) || row.expiresAt < new Date()) {
    return NextResponse.json({ status: "expired" });
  }

  if (row.status === "pending") {
    return NextResponse.json({ status: "pending" });
  }

  if (row.status === "claimed" && row.payload) {
    const config = JSON.parse(row.payload);
    await db
      .update(primeDeviceCodes)
      .set({ status: "consumed", payload: null })
      .where(eq(primeDeviceCodes.code, code));
    return NextResponse.json({ status: "activated", config });
  }

  return NextResponse.json({ status: "expired" });
}

export async function POST(request: Request) {
  let body: { code?: unknown; secret?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.toUpperCase() : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  return poll(code, secret);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return poll((url.searchParams.get("code") ?? "").toUpperCase(), url.searchParams.get("secret") ?? "");
}

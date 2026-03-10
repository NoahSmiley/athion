import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { encrypt } from "@/lib/crypto";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select({ keyHint: apiKeys.keyHint })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.provider, "anthropic")))
    .limit(1);

  return NextResponse.json({ keyHint: row?.keyHint ?? null });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { apiKey } = await request.json();
  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const encryptedKey = encrypt(apiKey);
  const keyHint = apiKey.slice(-4);

  const [existing] = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.provider, "anthropic")))
    .limit(1);

  if (existing) {
    await db
      .update(apiKeys)
      .set({ encryptedKey, keyHint, updatedAt: new Date() })
      .where(eq(apiKeys.id, existing.id));
  } else {
    await db.insert(apiKeys).values({
      userId: user.id,
      provider: "anthropic",
      encryptedKey,
      keyHint,
    });
  }

  return NextResponse.json({ keyHint });
}

export async function DELETE() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.userId, user.id), eq(apiKeys.provider, "anthropic")));

  return NextResponse.json({ ok: true });
}

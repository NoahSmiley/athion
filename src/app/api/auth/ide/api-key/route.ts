import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, users } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth/jwt";
import { decrypt } from "@/lib/crypto";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.sub) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  const [row] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, payload.sub), eq(apiKeys.provider, "anthropic")))
    .limit(1);

  if (!row) return NextResponse.json({ error: "No API key configured" }, { status: 404 });

  return NextResponse.json({
    apiKey: decrypt(row.encryptedKey),
    email: user?.email ?? null,
  });
}

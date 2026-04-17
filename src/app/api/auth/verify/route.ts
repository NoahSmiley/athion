import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.sub) return NextResponse.json({ error: "invalid token" }, { status: 401 });

  const [user] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: user.displayName,
    avatar_url: user.avatarUrl,
  });
}

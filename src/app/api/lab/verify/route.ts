import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { users, labPermissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = ["https://labs.athion.me", "http://localhost:5173", "http://localhost:3080"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401, headers });
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401, headers });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401, headers });
  }

  const [perm] = await db
    .select()
    .from(labPermissions)
    .where(eq(labPermissions.userId, user.id))
    .limit(1);

  if (!perm) {
    return NextResponse.json({ error: "No lab access" }, { status: 403, headers });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    permissions: {
      role: perm.role,
      allowedMachines: perm.allowedMachines ? JSON.parse(perm.allowedMachines) : null,
      canControl: perm.canControl,
      canTerminal: perm.canTerminal,
      canRcon: perm.canRcon,
    },
  }, { headers });
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = ["https://labs.athion.me", "http://localhost:5173", "http://localhost:3080"];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(null, { status: 204, headers });
}

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

// Allow Athion Prime (and its dev origin) to call logout cross-origin so the
// in-app sign-out flow can clear the shared .athion.me cookie.
const ALLOWED_ORIGINS = [
  "https://prime.athion.me",
  "http://localhost:1420",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: Request) {
  await clearSessionCookie();
  return NextResponse.json({ success: true }, { headers: corsHeaders(req.headers.get("origin")) });
}

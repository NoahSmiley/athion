import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ensureUser, issueUserToken, jellyfinPublicUrl } from "@/lib/jellyfin/admin";

const ALLOWED_ORIGINS = [
  "https://prime.athion.me",
  "http://localhost:1420", // Vite dev server for athion-prime-web
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);

  const me = await getSession();
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  // Stable per-(athion user, device) id so Jellyfin can dedupe sessions across reconnects.
  const deviceId = `prime-web:${me.id}`;

  try {
    const { jellyfinUserId, jellyfinUsername } = await ensureUser(me.id, me.username);
    const token = await issueUserToken(me.id, jellyfinUsername, deviceId);
    return NextResponse.json(
      {
        jellyfinUrl: jellyfinPublicUrl(),
        accessToken: token.accessToken,
        userId: token.userId,
        username: token.username,
        deviceId,
      },
      { headers }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "jellyfin_unavailable", detail: message }, { status: 503, headers });
  }
}

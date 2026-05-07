import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const ALLOWED_ORIGINS = [
  "https://prime.athion.me",
  "http://localhost:1420",
];

export function corsHeaders(origin: string | null, methods = "GET, OPTIONS"): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

/**
 * Resolves the current athion user from a request. Prefers the standard
 * `auth_token` cookie (production); falls back to `Authorization: Bearer <jwt>`
 * so the dev SPA on localhost — which can't send cross-site cookies — can
 * still authenticate by passing the JWT it minted to set up its dev session.
 */
export async function resolveSession(req: Request) {
  const cookieSession = await getSession();
  if (cookieSession) return cookieSession;

  const auth = req.headers.get("authorization");
  let token: string | undefined;
  if (auth?.startsWith("Bearer ")) {
    token = auth.slice(7).trim();
  } else {
    // The browser <video> tag can't attach an Authorization header, so the
    // play route accepts the dev JWT as a query param too.
    try {
      const url = new URL(req.url);
      const q = url.searchParams.get("dev_token");
      if (q) token = q;
    } catch {
      // ignore — req.url should always be parseable, but be defensive
    }
  }
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.sub) {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          displayName: users.displayName,
          role: users.role,
          avatarUrl: users.avatarUrl,
          stripeCustomerId: users.stripeCustomerId,
        })
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);
      return user ?? null;
    }
  }
  return null;
}

export function preflight(req: Request, methods?: string) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin"), methods),
  });
}

/**
 * Wraps a route handler with the session check + CORS headers used across
 * `/api/prime/xtream/*`. Caller's handler returns a `NextResponse` (or
 * any response body) — we'll merge headers in.
 */
export async function withPrimeAuth<T>(
  req: Request,
  handler: () => Promise<NextResponse<T> | { body: unknown; status?: number; init?: ResponseInit }>,
): Promise<NextResponse> {
  const headers = corsHeaders(req.headers.get("origin"));
  const me = await resolveSession(req);
  if (!me) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }
  try {
    const result = await handler();
    if (result instanceof NextResponse) {
      // Merge CORS headers into the response
      for (const [k, v] of Object.entries(headers)) result.headers.set(k, v);
      return result;
    }
    return NextResponse.json(result.body, { status: result.status ?? 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "xtream_unavailable", detail: message }, { status: 503, headers });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

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
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
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
  const me = await getSession();
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

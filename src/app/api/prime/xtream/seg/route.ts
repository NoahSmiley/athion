import { NextResponse } from "next/server";
import { corsHeaders, preflight } from "@/lib/xtream/route-helpers";
import { verifyUpstreamUrl } from "@/lib/xtream/proxy";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

/**
 * Streams a single media segment (or key/init blob) from the upstream
 * Xtream provider. Auth is the HMAC signature stamped on the URL when the
 * play route rewrote the playlist — only URLs we signed (10 min TTL) pass,
 * so this can't be used as an open proxy. No session check: the playlist
 * that mints these URLs is already session-gated.
 */
export async function GET(req: Request) {
  const headers = corsHeaders(req.headers.get("origin"));
  const url = new URL(req.url);
  const u = url.searchParams.get("u");

  if (!verifyUpstreamUrl(u, url.searchParams.get("exp"), url.searchParams.get("sig"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 403, headers });
  }

  let res: Response;
  try {
    res = await fetch(u as string, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "upstream_unreachable", detail }, { status: 502, headers });
  }
  if (!res.ok || !res.body) {
    return NextResponse.json(
      { error: "upstream_error", status: res.status },
      { status: 502, headers }
    );
  }

  // Pass the byte stream through without buffering the whole segment.
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": res.headers.get("content-type") ?? "video/mp2t",
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { streamUrl } from "@/lib/xtream/client";
import { corsHeaders, preflight, resolveSession } from "@/lib/xtream/route-helpers";
import { rewritePlaylist, verifyUpstreamUrl } from "@/lib/xtream/proxy";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

/**
 * Proxies the upstream HLS playlist instead of redirecting to it. The
 * provider is plain http:// with no CORS, so a redirect dies in the browser
 * (mixed content from an https page). We fetch server-side, then rewrite
 * every URI to come back through this route (nested playlists, via signed
 * `?u=`) or the seg route (media segments) — see lib/xtream/proxy.ts.
 */
export async function GET(req: Request, ctx: { params: Promise<{ streamId: string }> }) {
  const headers = corsHeaders(req.headers.get("origin"));
  const me = await resolveSession(req);
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });

  const url = new URL(req.url);
  const u = url.searchParams.get("u");

  let upstream: string;
  if (u !== null) {
    // Nested playlist hop — only URLs we signed during a rewrite are allowed.
    if (!verifyUpstreamUrl(u, url.searchParams.get("exp"), url.searchParams.get("sig"))) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 403, headers });
    }
    upstream = u;
  } else {
    const { streamId } = await ctx.params;
    const id = Number(streamId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid_stream_id" }, { status: 400, headers });
    }
    upstream = streamUrl(id);
  }

  let res: Response;
  try {
    res = await fetch(upstream, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "upstream_unreachable", detail }, { status: 502, headers });
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream_error", status: res.status },
      { status: 502, headers }
    );
  }

  const body = await res.text();
  if (!body.trimStart().startsWith("#EXTM3U")) {
    return NextResponse.json({ error: "upstream_not_hls" }, { status: 502, headers });
  }

  // res.url is the post-redirect URL — relative segment URIs resolve there.
  return new NextResponse(rewritePlaylist(body, res.url || upstream), {
    status: 200,
    headers: {
      ...headers,
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { streamUrl } from "@/lib/xtream/client";
import { corsHeaders, preflight, resolveSession } from "@/lib/xtream/route-helpers";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

/**
 * Returns a 302 redirect to the upstream HLS URL. The browser follows it
 * transparently — Xtream credentials live in the redirect target, never
 * in our own response payload, so the client side of the SPA never sees
 * them. The HLS player just sees a working .m3u8 URL.
 */
export async function GET(req: Request, ctx: { params: Promise<{ streamId: string }> }) {
  const headers = corsHeaders(req.headers.get("origin"));
  const me = await resolveSession(req);
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });

  const { streamId } = await ctx.params;
  const id = Number(streamId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "invalid_stream_id" }, { status: 400, headers });
  }

  return NextResponse.redirect(streamUrl(id), {
    status: 302,
    headers,
  });
}

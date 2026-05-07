import { NextResponse } from "next/server";
import { getEPG } from "@/lib/xtream/client";
import { corsHeaders, preflight, resolveSession } from "@/lib/xtream/route-helpers";

export async function OPTIONS(req: Request) {
  return preflight(req);
}

/**
 * Short EPG for a single stream. Cached at the edge for 5 minutes since
 * EPG data is dense and slow to refetch — same TTL the tvOS client uses.
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

  try {
    const entries = await getEPG(id);
    return NextResponse.json(entries, {
      headers: {
        ...headers,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "xtream_unavailable", detail: message }, { status: 503, headers });
  }
}

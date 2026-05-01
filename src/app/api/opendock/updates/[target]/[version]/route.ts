import { NextResponse } from "next/server";
import { findUpdateForTarget, isValidChannel, isValidTarget } from "@/lib/opendock/releases";
import { parseSemVer } from "@/lib/opendock/semver";

// Tauri updater endpoint. Called by the Opendock app on launch and every 6h.
// Path: /api/opendock/updates/<os>-<arch>/<current-version>?channel=stable
//
// Contract (Tauri v2):
//   - 204 No Content => already up to date (or no eligible artifact)
//   - 200 + JSON     => upgrade: { version, pub_date, url, signature, notes }
//   - 4xx            => malformed request; updater treats as failure
//
// Cache: clients re-check on their own cadence; we set a small max-age so a
// CDN doesn't hold a stale "no update" past an admin publishing a new release.
export async function GET(
  request: Request,
  context: { params: Promise<{ target: string; version: string }> },
) {
  const { target, version } = await context.params;
  const url = new URL(request.url);
  const channelParam = url.searchParams.get("channel") ?? "stable";

  if (!isValidTarget(target)) {
    return NextResponse.json({ error: "Unsupported target" }, { status: 400 });
  }
  if (!isValidChannel(channelParam)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
  }
  if (!parseSemVer(version)) {
    return NextResponse.json({ error: "Bad version" }, { status: 400 });
  }

  const match = await findUpdateForTarget(channelParam, target, version);
  if (!match) return new NextResponse(null, { status: 204, headers: { "cache-control": "public, max-age=60" } });

  const { release, artifact } = match;
  return NextResponse.json(
    {
      version: release.version,
      pub_date: release.pubDate.toISOString(),
      url: artifact.url,
      signature: artifact.signature,
      notes: release.notes,
    },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}

import { NextResponse } from "next/server";
import { getArtifactsForRelease, isValidChannel, listChannelReleases } from "@/lib/opendock/releases";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channelParam = url.searchParams.get("channel") ?? "stable";
  if (!isValidChannel(channelParam)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
  }

  const [latest] = await listChannelReleases(channelParam, 1);
  if (!latest) return NextResponse.json({ error: "No releases" }, { status: 404 });
  const artifacts = await getArtifactsForRelease(latest.id);

  return NextResponse.json(
    {
      version: latest.version,
      channel: latest.channel,
      pub_date: latest.pubDate.toISOString(),
      notes: latest.notes,
      artifacts: artifacts.map((a) => ({
        target: a.target,
        url: a.url,
        installer_url: a.installerUrl,
        sha256: a.sha256,
        size_bytes: a.sizeBytes,
      })),
    },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}

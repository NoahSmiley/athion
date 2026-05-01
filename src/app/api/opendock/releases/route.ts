import { NextResponse } from "next/server";
import { getArtifactsForRelease, isValidChannel, listChannelReleases } from "@/lib/opendock/releases";

type ArtifactJson = {
  target: string;
  url: string;
  installer_url: string | null;
  sha256: string;
  size_bytes: number;
};

type ReleaseJson = {
  version: string;
  channel: string;
  pub_date: string;
  notes: string;
  artifacts: ArtifactJson[];
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channelParam = url.searchParams.get("channel") ?? "stable";
  if (!isValidChannel(channelParam)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
  }

  const releases = await listChannelReleases(channelParam, 100);
  const out: ReleaseJson[] = await Promise.all(
    releases.map(async (r) => {
      const arts = await getArtifactsForRelease(r.id);
      return {
        version: r.version,
        channel: r.channel,
        pub_date: r.pubDate.toISOString(),
        notes: r.notes,
        artifacts: arts.map((a) => ({
          target: a.target,
          url: a.url,
          installer_url: a.installerUrl,
          sha256: a.sha256,
          size_bytes: a.sizeBytes,
        })),
      };
    }),
  );

  return NextResponse.json({ releases: out }, { headers: { "cache-control": "public, max-age=60" } });
}

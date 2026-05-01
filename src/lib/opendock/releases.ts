import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opendockReleases, opendockReleaseArtifacts } from "@/lib/db/schema";
import { isNewer } from "./semver";

export type Channel = "stable" | "beta";

const VALID_TARGETS = new Set([
  "darwin-aarch64",
  "darwin-x86_64",
  "windows-x86_64",
  "linux-x86_64",
]);

export function isValidTarget(target: string): boolean {
  return VALID_TARGETS.has(target);
}

export function isValidChannel(channel: string): channel is Channel {
  return channel === "stable" || channel === "beta";
}

export type ReleaseRow = typeof opendockReleases.$inferSelect;
export type ArtifactRow = typeof opendockReleaseArtifacts.$inferSelect;

export async function listChannelReleases(channel: Channel, limit = 100): Promise<ReleaseRow[]> {
  return db.select().from(opendockReleases)
    .where(and(eq(opendockReleases.channel, channel), eq(opendockReleases.yanked, false)))
    .orderBy(desc(opendockReleases.pubDate))
    .limit(limit);
}

export async function getArtifactsForRelease(releaseId: string): Promise<ArtifactRow[]> {
  return db.select().from(opendockReleaseArtifacts).where(eq(opendockReleaseArtifacts.releaseId, releaseId));
}

// Walks releases on the channel newest-first and returns the first release that
// (a) is newer than `currentVersion` and (b) has an artifact for `target`.
// Skipping releases without a matching artifact lets us ship platform-specific
// hotfixes without blocking other platforms.
export async function findUpdateForTarget(
  channel: Channel,
  target: string,
  currentVersion: string,
): Promise<{ release: ReleaseRow; artifact: ArtifactRow } | null> {
  const releases = await listChannelReleases(channel, 50);
  for (const release of releases) {
    if (!isNewer(release.version, currentVersion)) return null;
    const artifacts = await getArtifactsForRelease(release.id);
    const artifact = artifacts.find((a) => a.target === target);
    if (artifact) return { release, artifact };
  }
  return null;
}

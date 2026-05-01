// Minimal semver parser — major.minor.patch, optional `-prerelease`, no build metadata.
// We only need ordering, not full semver-2.0 compliance. Returns null for input
// the updater shouldn't trust (so it returns 204 rather than ship a bad upgrade).
export type SemVer = { major: number; minor: number; patch: number; pre: string | null };

export function parseSemVer(input: string): SemVer | null {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(input.trim());
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre: m[4] ?? null };
}

// Returns positive if a > b, negative if a < b, 0 if equal. Pre-releases sort
// below the same major.minor.patch (so 1.0.0-rc.1 < 1.0.0). Within pre-releases
// we just lexicographically compare the pre string — good enough for our channels.
export function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  if (a.pre === b.pre) return 0;
  if (a.pre === null) return 1;
  if (b.pre === null) return -1;
  return a.pre < b.pre ? -1 : 1;
}

export function isNewer(candidate: string, current: string): boolean {
  const c = parseSemVer(candidate);
  const cur = parseSemVer(current);
  if (!c || !cur) return false;
  return compareSemVer(c, cur) > 0;
}

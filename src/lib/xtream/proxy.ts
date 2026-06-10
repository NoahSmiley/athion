import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HLS proxy helpers for Live TV. The upstream Xtream provider is plain
 * http:// with no CORS, so the browser can never talk to it directly from
 * https://prime.athion.me (mixed content + CORS). Instead the play route
 * fetches playlists server-side and rewrites every URI in them to come back
 * through us; segment URIs point at the seg route which streams bytes
 * through. Rewritten URLs carry an HMAC signature + expiry so the seg route
 * can't be used as an open proxy.
 */

const SECRET = process.env.XTREAM_PROXY_SECRET ?? process.env.JWT_SECRET;

function hmac(payload: string): string {
  if (!SECRET) {
    throw new Error("Xtream proxy not configured: set XTREAM_PROXY_SECRET or JWT_SECRET.");
  }
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function signUpstreamUrl(upstream: string, ttlSeconds = 600): URLSearchParams {
  const exp = String(Math.floor(Date.now() / 1000) + ttlSeconds);
  return new URLSearchParams({ u: upstream, exp, sig: hmac(`${upstream}|${exp}`) });
}

export function verifyUpstreamUrl(
  u: string | null,
  exp: string | null,
  sig: string | null
): boolean {
  if (!u || !exp || !sig) return false;
  if (!/^https?:\/\//i.test(u)) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(hmac(`${u}|${exp}`));
  const actual = Buffer.from(sig);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Rewrites every URI in an HLS playlist to route back through our proxy.
 * Relative output URIs resolve against the play route's own URL
 * (/api/prime/xtream/play/<id>), so:
 *   - nested playlists  → "p?u=…"      → /api/prime/xtream/play/p?u=…
 *   - media segments    → "../seg?u=…" → /api/prime/xtream/seg?u=…
 * Relative (instead of absolute) output sidesteps http/https ambiguity
 * behind the reverse proxy and works identically in dev.
 */
export function rewritePlaylist(body: string, finalUpstreamUrl: string): string {
  const base = new URL(finalUpstreamUrl);

  const proxied = (rawUri: string): string => {
    let abs: string;
    try {
      abs = new URL(rawUri, base).toString();
    } catch {
      return rawUri; // leave unparseable lines untouched
    }
    const path = abs.replace(/[?#].*$/, "").toLowerCase();
    const params = signUpstreamUrl(abs);
    return path.endsWith(".m3u8") ? `p?${params}` : `../seg?${params}`;
  };

  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        // Tags like EXT-X-KEY / EXT-X-MAP / EXT-X-MEDIA carry URI="…"
        return line.replace(/URI="([^"]+)"/g, (_m, uri: string) => `URI="${proxied(uri)}"`);
      }
      return proxied(trimmed);
    })
    .join("\n");
}

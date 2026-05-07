/**
 * Server-side Xtream Codes API client. Lives only in athion.me — never
 * shipped to the browser. Wraps the player_api.php endpoints used by
 * Athion Prime tvOS today (mirrored 1:1 so the SPA can replace tvOS).
 *
 * Auth uses Xtream's URL-style credentials (`?username=&password=`),
 * read from env. The browser never sees these — every request from the
 * SPA goes through `/api/prime/xtream/*` and our handlers attach creds
 * before forwarding.
 */

export type XtreamCategory = {
  category_id: string;
  category_name: string;
  parent_id: number;
};

export type XtreamStream = {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string | null;
  epg_channel_id: string | null;
  category_id: string | null;
  tv_archive: number;
};

/** Raw EPG entry as returned by Xtream — `title` and `description` are base64. */
export type XtreamEPGEntryRaw = {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  channel_id: string | null;
  stream_id: string | null;
};

/** Same as raw but with title/description decoded for the SPA. */
export type XtreamEPGEntry = Omit<XtreamEPGEntryRaw, "title" | "description"> & {
  title: string;
  description: string;
};

type XtreamEPGResponse = { epg_listings: XtreamEPGEntryRaw[] };

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set in environment`);
  return v;
}

function baseConfig() {
  return {
    baseUrl: env("XTREAM_BASE_URL").replace(/\/+$/, ""),
    username: env("XTREAM_USERNAME"),
    password: env("XTREAM_PASSWORD"),
  };
}

function apiUrl(action: string | null, extra: Record<string, string> = {}): string {
  const { baseUrl, username, password } = baseConfig();
  const url = new URL(`${baseUrl}/player_api.php`);
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);
  if (action) url.searchParams.set("action", action);
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  return url.toString();
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    // Upstream is an HTTP origin; cache nothing by default — categories and
    // streams change rarely but a stale 5-min cache is safer to do at the
    // route handler than here.
    cache: "no-store",
    headers: { ...(init?.headers ?? {}), "User-Agent": "AthionPrime/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Xtream upstream ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

function decodeBase64(s: string): string {
  // Many Xtream providers base64-encode the EPG title and description so the
  // ASCII-only player_api response stays clean. Decode best-effort; if it's
  // not valid base64, return the raw string.
  try {
    return Buffer.from(s, "base64").toString("utf-8");
  } catch {
    return s;
  }
}

export async function getCategories(): Promise<XtreamCategory[]> {
  return request<XtreamCategory[]>(apiUrl("get_live_categories"));
}

export async function getLiveStreams(categoryId?: string): Promise<XtreamStream[]> {
  const extra: Record<string, string> = {};
  if (categoryId) extra.category_id = categoryId;
  return request<XtreamStream[]>(apiUrl("get_live_streams", extra));
}

export async function getEPG(streamId: number, limit = 4): Promise<XtreamEPGEntry[]> {
  const res = await request<XtreamEPGResponse>(
    apiUrl("get_short_epg", { stream_id: String(streamId), limit: String(limit) }),
  );
  return (res.epg_listings ?? []).map((e) => ({
    ...e,
    title: decodeBase64(e.title),
    description: decodeBase64(e.description),
  }));
}

/**
 * Returns the upstream m3u8 URL for a stream. Used by the play/[streamId]
 * route to redirect the browser; never returned directly to the client.
 */
export function streamUrl(streamId: number): string {
  const { baseUrl, username, password } = baseConfig();
  return `${baseUrl}/live/${username}/${password}/${streamId}.m3u8`;
}

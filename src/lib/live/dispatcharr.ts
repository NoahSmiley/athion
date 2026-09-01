import { createHmac } from "node:crypto";

// Dispatcharr admin client — provisions one live-TV (Xtream Codes) user per
// athion member, so no two devices share a credential and one lost TV never
// forces rotating everyone. Mirrors the Jellyfin admin lib: deterministic
// passwords derived from a server secret, nothing stored.
const DISPATCHARR_URL = process.env.DISPATCHARR_URL?.replace(/\/$/, "");
const DISPATCHARR_ADMIN_USERNAME = process.env.DISPATCHARR_ADMIN_USERNAME;
const DISPATCHARR_ADMIN_PASSWORD = process.env.DISPATCHARR_ADMIN_PASSWORD;
const LIVE_USER_PASSWORD_SECRET = process.env.LIVE_USER_PASSWORD_SECRET;

export function liveUsersConfigured(): boolean {
  return Boolean(
    DISPATCHARR_URL &&
      DISPATCHARR_ADMIN_USERNAME &&
      DISPATCHARR_ADMIN_PASSWORD &&
      LIVE_USER_PASSWORD_SECRET
  );
}

// Hex, not base64url: these credentials travel as URL *path* segments
// (/live/{user}/{pass}/{id}.m3u8), so stay strictly alphanumeric.
function passwordFor(athionUserId: string): string {
  return createHmac("sha256", LIVE_USER_PASSWORD_SECRET!)
    .update(`live:${athionUserId}`)
    .digest("hex")
    .slice(0, 24);
}

// Same naming scheme as the Jellyfin side so an admin scanning either
// service's user list sees the same identities.
function liveUsernameFor(athionUsername: string | null, athionUserId: string): string {
  if (athionUsername) {
    const sanitized = athionUsername.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (sanitized.length >= 1) return `athion_${sanitized}`;
  }
  return `athion_${athionUserId.slice(0, 8)}`;
}

interface DispatcharrUser {
  id: number;
  username: string;
  custom_properties?: { xc_password?: string } | null;
}

async function adminToken(): Promise<string> {
  const res = await fetch(`${DISPATCHARR_URL}/api/accounts/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: DISPATCHARR_ADMIN_USERNAME,
      password: DISPATCHARR_ADMIN_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Dispatcharr token endpoint returned ${res.status}`);
  const json = (await res.json()) as { access?: string };
  if (!json.access) throw new Error("Dispatcharr token response had no access token");
  return json.access;
}

export interface LiveCredentials {
  username: string;
  password: string;
}

// Idempotent: finds the member's Dispatcharr user or creates it. The XC
// password is deterministic, so an existing user whose stored xc_password
// drifted (manual edits, restores) is patched back into agreement.
export async function ensureLiveUser(
  athionUserId: string,
  athionUsername: string | null
): Promise<LiveCredentials | null> {
  if (!liveUsersConfigured()) return null;

  const username = liveUsernameFor(athionUsername, athionUserId);
  const password = passwordFor(athionUserId);
  const token = await adminToken();
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const listRes = await fetch(`${DISPATCHARR_URL}/api/accounts/users/`, { headers: auth });
  if (!listRes.ok) throw new Error(`Dispatcharr users list returned ${listRes.status}`);
  const existing = ((await listRes.json()) as DispatcharrUser[]).find(
    (u) => u.username === username
  );

  if (existing) {
    if (existing.custom_properties?.xc_password !== password) {
      const patch = await fetch(`${DISPATCHARR_URL}/api/accounts/users/${existing.id}/`, {
        method: "PATCH",
        headers: auth,
        body: JSON.stringify({ password, custom_properties: { xc_password: password } }),
      });
      if (!patch.ok) throw new Error(`Dispatcharr user patch returned ${patch.status}`);
    }
    return { username, password };
  }

  const create = await fetch(`${DISPATCHARR_URL}/api/accounts/users/`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      username,
      password,
      user_level: 0,
      custom_properties: { xc_password: password },
    }),
  });
  if (!create.ok) {
    const body = await create.text().catch(() => "");
    throw new Error(`Dispatcharr user create returned ${create.status}: ${body}`);
  }
  return { username, password };
}

import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jellyfinUsers } from "@/lib/db/schema";

const JELLYFIN_URL = process.env.JELLYFIN_URL?.replace(/\/$/, "");
// Browser-reachable URL handed to Prime clients. The server keeps using JELLYFIN_URL
// (LAN) for admin calls; browsers need the HTTPS tunnel hostname or fetches get
// blocked as mixed content / are unreachable off-LAN.
const JELLYFIN_PUBLIC_URL = process.env.JELLYFIN_PUBLIC_URL?.replace(/\/$/, "");
const JELLYFIN_ADMIN_TOKEN = process.env.JELLYFIN_ADMIN_TOKEN;
const JELLYFIN_USER_PASSWORD_SECRET = process.env.JELLYFIN_USER_PASSWORD_SECRET;
const PRIME_DEVICE_ID_NAMESPACE = "athion-prime";

function requireConfig(): { url: string; adminToken: string; passwordSecret: string } {
  if (!JELLYFIN_URL || !JELLYFIN_ADMIN_TOKEN || !JELLYFIN_USER_PASSWORD_SECRET) {
    throw new Error(
      "Jellyfin admin client not configured. Set JELLYFIN_URL, JELLYFIN_ADMIN_TOKEN, JELLYFIN_USER_PASSWORD_SECRET."
    );
  }
  return {
    url: JELLYFIN_URL,
    adminToken: JELLYFIN_ADMIN_TOKEN,
    passwordSecret: JELLYFIN_USER_PASSWORD_SECRET,
  };
}

function authHeader(token: string, deviceId: string): string {
  return `MediaBrowser Client="Athion Prime", Device="Prime Web", DeviceId="${deviceId}", Version="1.0.0", Token="${token}"`;
}

// Deterministic per-user password. Same input always produces the same output, so we never
// store the plaintext — we recompute it whenever we need to authenticate as the user.
function passwordFor(athionUserId: string, secret: string): string {
  return createHmac("sha256", secret).update(athionUserId).digest("base64url");
}

// Sanitize an athion username for Jellyfin's character rules. Jellyfin allows letters,
// digits, hyphens, underscores, dots, apostrophes — but for hygiene we restrict to
// [a-z0-9_-]. Falls back to a stable token derived from the athion user id.
function jellyfinUsernameFor(athionUsername: string | null, athionUserId: string): string {
  if (athionUsername) {
    const sanitized = athionUsername.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    // Prefix all athion-managed Jellyfin users with `athion_` so they're
    // distinguishable from any pre-existing Jellyfin users and never collide.
    if (sanitized.length >= 1) return `athion_${sanitized}`;
  }
  return `athion_${athionUserId.slice(0, 8)}`;
}

interface JellyfinUserDto {
  Id: string;
  Name: string;
}

interface JellyfinAuthResponse {
  AccessToken: string;
  User: JellyfinUserDto;
}

async function jfFetch<T>(
  path: string,
  init: RequestInit & { adminAuth?: boolean; deviceId?: string } = {}
): Promise<T> {
  const { url, adminToken } = requireConfig();
  const { adminAuth, deviceId, headers, ...rest } = init;
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };
  if (adminAuth) {
    finalHeaders["Authorization"] = authHeader(adminToken, deviceId ?? PRIME_DEVICE_ID_NAMESPACE);
  }
  const res = await fetch(`${url}${path}`, { ...rest, headers: finalHeaders });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jellyfin ${path} returned ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface EnsuredJellyfinUser {
  jellyfinUserId: string;
  jellyfinUsername: string;
}

// Idempotent: looks up existing mapping, otherwise provisions a Jellyfin user and
// inserts the mapping row. Safe to call on every /api/prime/jellyfin-token request.
export async function ensureUser(
  athionUserId: string,
  athionUsername: string | null
): Promise<EnsuredJellyfinUser> {
  const [existing] = await db
    .select()
    .from(jellyfinUsers)
    .where(eq(jellyfinUsers.athionUserId, athionUserId))
    .limit(1);
  if (existing) {
    return {
      jellyfinUserId: existing.jellyfinUserId,
      jellyfinUsername: existing.jellyfinUsername,
    };
  }

  const { passwordSecret } = requireConfig();
  const jellyfinUsername = jellyfinUsernameFor(athionUsername, athionUserId);
  const password = passwordFor(athionUserId, passwordSecret);

  // Create the user. /Users/New returns the new user object including its Id.
  const created = await jfFetch<JellyfinUserDto>("/Users/New", {
    method: "POST",
    adminAuth: true,
    body: JSON.stringify({ Name: jellyfinUsername, Password: password }),
  });

  await db.insert(jellyfinUsers).values({
    athionUserId,
    jellyfinUserId: created.Id,
    jellyfinUsername,
  });

  return { jellyfinUserId: created.Id, jellyfinUsername };
}

export interface IssuedJellyfinToken {
  accessToken: string;
  userId: string;
  username: string;
}

// Authenticates as the Jellyfin user (using the deterministic password) and returns
// a fresh access token + canonical user id. Each call yields a new short-lived token.
export async function issueUserToken(
  athionUserId: string,
  jellyfinUsername: string,
  deviceId: string
): Promise<IssuedJellyfinToken> {
  const { passwordSecret } = requireConfig();
  const password = passwordFor(athionUserId, passwordSecret);

  const auth = await jfFetch<JellyfinAuthResponse>("/Users/AuthenticateByName", {
    method: "POST",
    deviceId,
    headers: {
      Authorization: `MediaBrowser Client="Athion Prime", Device="Prime Web", DeviceId="${deviceId}", Version="1.0.0"`,
    },
    body: JSON.stringify({ Username: jellyfinUsername, Pw: password }),
  });

  return {
    accessToken: auth.AccessToken,
    userId: auth.User.Id,
    username: auth.User.Name,
  };
}

export function jellyfinPublicUrl(): string {
  const { url } = requireConfig();
  return JELLYFIN_PUBLIC_URL ?? url;
}

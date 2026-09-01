import { ensureUser, issueUserToken, jellyfinPublicUrl } from "@/lib/jellyfin/admin";
import { ensureLiveUser } from "@/lib/live/dispatcharr";

export interface PrimeMember {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string;
}

/**
 * The full config payload an activated Prime TV runs on. Shared by claim
 * (first activation) and renew (silent recovery), so a renewed device ends
 * up in exactly the state a fresh activation would.
 *
 * Live TV: each member gets their own Dispatcharr credential — one lost or
 * leaked device revokes one member, not the whole household. If provisioning
 * fails the shared env credential keeps onboarding alive rather than failing
 * the activation over the lineup.
 */
export async function buildPrimeConfig(
  member: PrimeMember,
  deviceId: string
): Promise<Record<string, unknown>> {
  const { jellyfinUsername } = await ensureUser(member.id, member.username);
  const token = await issueUserToken(member.id, jellyfinUsername, deviceId);

  const config: Record<string, unknown> = {
    memberName: member.displayName ?? member.username ?? member.email,
    jellyfin: {
      url: jellyfinPublicUrl(),
      accessToken: token.accessToken,
      userId: token.userId,
      username: token.username,
      deviceId,
    },
  };

  const xtreamBase = process.env.XTREAM_BASE_URL?.replace(/\/+$/, "");
  if (xtreamBase) {
    let live = null;
    try {
      live = await ensureLiveUser(member.id, member.username);
    } catch (error) {
      console.error("[prime] Dispatcharr provisioning failed, using shared credential:", error);
    }
    const username = live?.username ?? process.env.XTREAM_USERNAME;
    const password = live?.password ?? process.env.XTREAM_PASSWORD;
    if (username && password) {
      config.xtream = { url: xtreamBase, username, password };
    }
  }

  return config;
}

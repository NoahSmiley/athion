import { ensureUser, issueUserToken, jellyfinPublicUrl } from "@/lib/jellyfin/admin";
import { ensureLiveUser } from "@/lib/live/dispatcharr";

export interface PrimeMember {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string;
}

/**
 * Operator levers every activated TV honors on its next renew or telemetry
 * flush. PRIME_MIN_BUILD blocks builds below it with a sheet (kill switch
 * for a bad release); PRIME_NOTICE is a one-line message shown once.
 */
export function primeFlags(appVersion: string | null): {
  minBuild: number | null;
  notice: string | null;
  belowMinimum: boolean;
} {
  const minBuild = Number(process.env.PRIME_MIN_BUILD ?? "");
  const notice = process.env.PRIME_NOTICE?.trim() || null;
  // appVersion arrives as "1.0 (57)" or "57"; the build number is the last
  // integer in the string.
  const build = appVersion ? Number((appVersion.match(/(\d+)(?!.*\d)/) ?? [])[1] ?? NaN) : NaN;
  const hasMin = Number.isFinite(minBuild) && minBuild > 0;
  return {
    minBuild: hasMin ? minBuild : null,
    notice,
    belowMinimum: hasMin && Number.isFinite(build) && build < minBuild,
  };
}

/**
 * The full config payload an activated Prime TV runs on. Shared by claim
 * (first activation) and renew (silent recovery), so a renewed device ends
 * up in exactly the state a fresh activation would.
 *
 * Live TV: each member gets their own Dispatcharr credential — one lost or
 * leaked device revokes one member, not the whole household. If provisioning
 * fails the shared env credential keeps onboarding alive rather than failing
 * the activation over the lineup — but the payload SAYS so
 * (`liveProvisioning: "shared"`), the failure is logged as an error, and the
 * next renew retries the member credential.
 *
 * Home network: the AthionCast origin (LAN un-hairpin + server DVR) is handed
 * out when configured. Off the LAN the TV's reachability probe fails once and
 * it falls back to the tunnel, so remote members lose nothing.
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
    let liveError: unknown = null;
    try {
      live = await ensureLiveUser(member.id, member.username);
    } catch (error) {
      liveError = error;
      console.error(
        `[prime] live-TV provisioning failed for ${member.email} (${deviceId}); handing out the SHARED credential:`,
        error
      );
    }
    const username = live?.username ?? process.env.XTREAM_USERNAME;
    const password = live?.password ?? process.env.XTREAM_PASSWORD;
    if (username && password) {
      config.xtream = { url: xtreamBase, username, password };
      config.liveProvisioning = live ? "member" : "shared";
      if (!live && liveError) config.liveProvisioningError = String(liveError).slice(0, 200);
    }
  }

  const castUrl = process.env.ATHIONCAST_URL?.replace(/\/+$/, "");
  const castToken = process.env.ATHIONCAST_TOKEN;
  if (castUrl && castToken) {
    config.athionCast = { url: castUrl, token: castToken };
  }

  return config;
}

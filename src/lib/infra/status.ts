import { queryA2S } from "./a2s";
import { queryMC } from "./mc";

export type ServiceStatus = {
  online: boolean;
  players?: number;
  maxPlayers?: number;
  uptimeSeconds?: number;
  error?: string;
  checkedAt: number;
};

type CacheEntry = { value: ServiceStatus; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

async function withCache(key: string, fn: () => Promise<ServiceStatus>): Promise<ServiceStatus> {
  const hit = cache.get(key);
  const now = Date.now();
  if (hit && hit.expires > now) return hit.value;
  const value = await fn();
  cache.set(key, { value, expires: now + TTL_MS });
  return value;
}

// Probe on CT 110 returns systemd uptime since the A2S query alone can't tell us when the service started.
async function fetchProbe(host: string): Promise<{ uptimeSeconds: number; active: boolean } | null> {
  try {
    const res = await fetch(`http://${host}:9876/status`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = await res.json();
    return { uptimeSeconds: j.uptime_seconds, active: j.active };
  } catch {
    return null;
  }
}

export async function getZomboidStatus(): Promise<ServiceStatus> {
  return withCache("zomboid", async () => {
    const checkedAt = Date.now();
    const [a2s, probe] = await Promise.allSettled([
      queryA2S("192.168.0.59", 27045),
      fetchProbe("192.168.0.59"),
    ]);
    if (a2s.status === "rejected") {
      return { online: false, error: "unreachable", checkedAt };
    }
    return {
      online: true,
      players: a2s.value.players,
      maxPlayers: a2s.value.maxPlayers,
      uptimeSeconds: probe.status === "fulfilled" ? probe.value?.uptimeSeconds : undefined,
      checkedAt,
    };
  });
}

export async function getMinecraftStatus(): Promise<ServiceStatus> {
  return withCache("minecraft", async () => {
    const checkedAt = Date.now();
    try {
      const r = await queryMC("192.168.0.24", 25565);
      return { online: true, players: r.players, maxPlayers: r.maxPlayers, checkedAt };
    } catch {
      return { online: false, error: "unreachable", checkedAt };
    }
  });
}

export function formatUptime(seconds?: number): string | null {
  if (!seconds || seconds < 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

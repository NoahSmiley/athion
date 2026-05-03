import { queryA2S } from "./a2s";
import { queryMC } from "./mc";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export type ServiceStatus = {
  online: boolean;
  players?: number;
  maxPlayers?: number;
  uptimeSeconds?: number;
  latencyMs?: number;
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

async function probeHttp(url: string, timeoutMs = 3000): Promise<ServiceStatus> {
  const checkedAt = Date.now();
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
      redirect: "manual",
    });
    const latencyMs = Math.round(performance.now() - start);
    // Any 2xx/3xx counts as up. 5xx means the upstream is broken.
    const online = res.status < 500;
    return online
      ? { online: true, latencyMs, checkedAt }
      : { online: false, error: `HTTP ${res.status}`, latencyMs, checkedAt };
  } catch (e) {
    return { online: false, error: e instanceof Error ? e.name : "fetch failed", checkedAt };
  }
}

export async function getZomboidStatus(): Promise<ServiceStatus> {
  return withCache("zomboid", async () => {
    const checkedAt = Date.now();
    const start = performance.now();
    const [a2s, probe] = await Promise.allSettled([
      queryA2S("192.168.0.59", 27045),
      fetchProbe("192.168.0.59"),
    ]);
    const latencyMs = Math.round(performance.now() - start);
    if (a2s.status === "rejected") {
      return { online: false, error: "unreachable", latencyMs, checkedAt };
    }
    return {
      online: true,
      players: a2s.value.players,
      maxPlayers: a2s.value.maxPlayers,
      uptimeSeconds: probe.status === "fulfilled" ? probe.value?.uptimeSeconds : undefined,
      latencyMs,
      checkedAt,
    };
  });
}

export async function getMinecraftStatus(): Promise<ServiceStatus> {
  return withCache("minecraft", async () => {
    const checkedAt = Date.now();
    const start = performance.now();
    try {
      const r = await queryMC("192.168.0.24", 25565);
      return { online: true, players: r.players, maxPlayers: r.maxPlayers, latencyMs: Math.round(performance.now() - start), checkedAt };
    } catch {
      return { online: false, error: "unreachable", latencyMs: Math.round(performance.now() - start), checkedAt };
    }
  });
}

export async function getAthionWebStatus(): Promise<ServiceStatus> {
  return withCache("athion-web", async () => probeHttp("http://localhost:3000/api/health"));
}

export async function getJellyfinStatus(): Promise<ServiceStatus> {
  return withCache("jellyfin", async () => probeHttp("http://192.168.0.159:8096/health"));
}

export async function getVaultwardenStatus(): Promise<ServiceStatus> {
  return withCache("vaultwarden", async () => probeHttp("http://192.168.0.160:8080/alive"));
}

export async function getAudiobookshelfStatus(): Promise<ServiceStatus> {
  return withCache("audiobookshelf", async () => probeHttp("http://192.168.0.161:13378/healthcheck"));
}

export async function getPostgresStatus(): Promise<ServiceStatus> {
  return withCache("postgres", async () => {
    const checkedAt = Date.now();
    const start = performance.now();
    try {
      await db.execute(sql`select 1`);
      return { online: true, latencyMs: Math.round(performance.now() - start), checkedAt };
    } catch (e) {
      return { online: false, error: e instanceof Error ? e.name : "query failed", latencyMs: Math.round(performance.now() - start), checkedAt };
    }
  });
}

export async function getAllStatuses() {
  const [zomboid, minecraft, athionWeb, jellyfin, vaultwarden, audiobookshelf, postgres] = await Promise.all([
    getZomboidStatus(),
    getMinecraftStatus(),
    getAthionWebStatus(),
    getJellyfinStatus(),
    getVaultwardenStatus(),
    getAudiobookshelfStatus(),
    getPostgresStatus(),
  ]);
  return { zomboid, minecraft, athionWeb, jellyfin, vaultwarden, audiobookshelf, postgres };
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

import { queryMC } from "./mc";

export type ServiceStatus = {
  online: boolean;
  players?: number;
  maxPlayers?: number;
  latencyMs?: number;
  checkedAt: number;
};

type CacheEntry = { value: ServiceStatus; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_MS = 30_000;

async function withCache(key: string, probe: () => Promise<ServiceStatus>): Promise<ServiceStatus> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const value = await probe();
  cache.set(key, { value, expiresAt: now + CACHE_MS });
  return value;
}

async function probeHttp(url: string): Promise<ServiceStatus> {
  const checkedAt = Date.now();
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
      redirect: "manual",
    });
    return {
      online: response.status < 500,
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt,
    };
  } catch {
    return { online: false, checkedAt };
  }
}

export function getAthionWebStatus(): Promise<ServiceStatus> {
  return withCache("athion-web", () => probeHttp("http://localhost:3000/api/health"));
}

export function getPrimeStatus(): Promise<ServiceStatus> {
  return withCache("prime", () => probeHttp("https://prime.athion.me/"));
}

export function getMinecraftStatus(): Promise<ServiceStatus> {
  return withCache("minecraft", async () => {
    const checkedAt = Date.now();
    const startedAt = performance.now();
    try {
      const result = await queryMC("192.168.0.24", 25565);
      return {
        online: true,
        players: result.players,
        maxPlayers: result.maxPlayers,
        latencyMs: Math.round(performance.now() - startedAt),
        checkedAt,
      };
    } catch {
      return {
        online: false,
        latencyMs: Math.round(performance.now() - startedAt),
        checkedAt,
      };
    }
  });
}

export async function getAllStatuses() {
  const [athionWeb, minecraft, prime] = await Promise.all([
    getAthionWebStatus(),
    getMinecraftStatus(),
    getPrimeStatus(),
  ]);
  return { athionWeb, minecraft, prime };
}

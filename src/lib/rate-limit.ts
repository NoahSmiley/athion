// In-memory rate limiter. Resets when the process restarts. Good enough for
// low-traffic abuse prevention; replace with Redis if we ever scale.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }
  if (b.count >= maxRequests) {
    return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, remaining: maxRequests - b.count, retryAfterMs: 0 };
}

// Pull the client IP out of a Next.js Request. Behind Cloudflare (which we
// are), `cf-connecting-ip` is authoritative. Behind Caddy locally, fall back
// to `x-forwarded-for`.
export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return "unknown";
}

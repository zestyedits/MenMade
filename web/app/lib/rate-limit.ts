/**
 * Minimal in-memory IP-based rate limiter. Good enough for a single
 * Vercel region pre-scale. Migrate to Upstash Redis (free tier 10k
 * req/day) when traffic spans multiple instances.
 *
 * Each (bucketKey + ip) gets its own counter that resets after windowMs.
 * Returns { ok, remaining, retryAfterSeconds } per call.
 *
 * Memory bound: ~50 bytes per entry, auto-evicted on next call after
 * window expires. Caps the map at 10,000 entries to defend against
 * IP-spray DoS (oldest entries pruned).
 */

type Entry = { count: number; resetAt: number; signaled?: boolean };

const buckets = new Map<string, Entry>();
const MAX_ENTRIES = 10_000;

function pruneIfFull() {
  if (buckets.size < MAX_ENTRIES) return;
  // Drop the oldest ~10% of entries when we hit the cap.
  const cutoff = Math.floor(MAX_ENTRIES * 0.1);
  const keys = Array.from(buckets.keys()).slice(0, cutoff);
  for (const k of keys) buckets.delete(k);
}

export type RateLimitVerdict = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
  /** True only on the first violation within this window. Lets callers
   *  emit one Buddy signal per (key, ip, window) without spamming. */
  firstViolation: boolean;
};

export function rateLimit(opts: {
  bucketKey: string;
  ip: string;
  limit: number;
  windowMs: number;
}): RateLimitVerdict {
  const key = `${opts.bucketKey}:${opts.ip}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    pruneIfFull();
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return {
      ok: true,
      remaining: opts.limit - 1,
      retryAfterSeconds: 0,
      firstViolation: false,
    };
  }

  if (existing.count >= opts.limit) {
    const firstViolation = !existing.signaled;
    existing.signaled = true;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      firstViolation,
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: opts.limit - existing.count,
    retryAfterSeconds: 0,
    firstViolation: false,
  };
}

/**
 * Extract a best-effort client IP from the request headers. On Vercel,
 * x-forwarded-for is set by the edge proxy; locally, falls back to a
 * placeholder so rate limiting still works.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "local";
}

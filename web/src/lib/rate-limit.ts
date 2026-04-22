/**
 * Minimal in-memory rate limiter for API routes. Suitable for single-region
 * deployments; upgrade to a Redis or Upstash-backed implementation once the
 * app runs on multiple serverless regions.
 *
 * Usage:
 *   const hit = rateLimit(`checkout:${userId}`, { window: 60_000, max: 10 });
 *   if (!hit.ok) return new NextResponse("Too many requests", { status: 429 });
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { window: number; max: number }) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.window });
    return { ok: true, remaining: opts.max - 1, resetAt: now + opts.window };
  }
  b.count++;
  return {
    ok: b.count <= opts.max,
    remaining: Math.max(0, opts.max - b.count),
    resetAt: b.resetAt,
  };
}

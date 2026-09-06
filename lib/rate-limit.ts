/**
 * In-memory fixed-window rate limiter.
 *
 * SCOPE AND LIMITS — read before relying on this.
 *
 * State lives in the process, so it does NOT hold across serverless
 * instances or a restart. On Vercel that means an attacker hitting
 * different lambdas gets a fresh budget each time. For a marketing
 * enquiry form this is an acceptable first layer: combined with the
 * honeypot and timing checks it stops casual abuse and accidental
 * double-submits, which is the realistic threat here.
 *
 * It is NOT sufficient if the form ever becomes a login, a password
 * reset, or anything with a per-identity cost. At that point swap the
 * store for Upstash/Redis — the interface below is deliberately small so
 * that is a one-file change, and see docs/08-security.md.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

// Bound the map so a flood of unique keys cannot grow it without limit —
// an unbounded Map keyed on client input is itself a memory-exhaustion bug.
const MAX_KEYS = 10_000;

export function rateLimit(
  key: string,
  {
    limit,
    windowMs,
    consume = true,
  }: { limit: number; windowMs: number; consume?: boolean },
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  // `consume: false` asks "would this be allowed?" without spending from the
  // budget. It lets a caller check the limit early — before doing any work —
  // and only charge for the requests that were actually worth something.
  // See app/contact/actions.ts for why that distinction matters there.
  if (!consume) {
    if (!existing || now >= existing.resetAt) {
      return { ok: true, retryAfterSec: 0 };
    }
    return existing.count >= limit
      ? {
          ok: false,
          retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        }
      : { ok: true, retryAfterSec: 0 };
  }

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_KEYS) {
      // Cheap eviction: drop everything already expired, and if that frees
      // nothing, clear outright rather than leak.
      for (const [k, v] of buckets) {
        if (now >= v.resetAt) buckets.delete(k);
      }
      if (buckets.size >= MAX_KEYS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

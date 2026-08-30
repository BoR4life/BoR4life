/**
 * Canonical site origin.
 *
 * Deliberately NOT `process.env.NEXT_PUBLIC_SITE_URL ?? fallback`. The `??`
 * operator only falls back on null/undefined, so an env var defined as an
 * EMPTY STRING passes straight through — and `new URL('')` throws
 * ERR_INVALID_URL. That is exactly what broke the first deployments: the
 * variable existed in the platform with no value, the build compiled
 * cleanly, and then died collecting page data with a bare "Invalid URL".
 *
 * An empty or whitespace-only value is treated as absent, which is what
 * anyone setting it would expect. A malformed value is rejected too, rather
 * than being allowed to fail later somewhere less obvious.
 */
const FALLBACK = 'https://www.bundleofrays.com';

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK;

  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    // Never fail a build over a mistyped environment variable.
    return FALLBACK;
  }
}

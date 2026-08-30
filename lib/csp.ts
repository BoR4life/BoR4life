/**
 * connect-src origin allow-list.
 *
 * The policy is `connect-src 'self'` by default and that is the correct
 * default: this site calls no third-party APIs from the browser, so any
 * outbound request from a page is either ours or an injection.
 *
 * The one legitimate exception is analytics. When the site is configured
 * with a PostHog host, the browser must be able to reach it — and until
 * this existed, setting NEXT_PUBLIC_POSTHOG_KEY produced a site where
 * analytics initialised, fired, and had every request refused by CSP.
 * That fails silently: no console error a visitor sees, no server log, just
 * an empty dashboard and a false belief that traffic is being measured.
 *
 * The allow-list is derived from configuration rather than hard-coded, and
 * reduced to a bare origin — a full URL in a CSP source expression is a
 * path match, which is both wrong here and easy to get subtly wrong.
 * Anything unparseable is dropped rather than concatenated into the header:
 * an attacker-controlled env var must never be able to inject a directive
 * separator and rewrite the rest of the policy.
 */
export function analyticsOrigins(
  env: Record<string, string | undefined>,
): string[] {
  // Both are required to initialise analytics (see PostHogProvider), so a
  // host without a key would widen the policy for something that never runs.
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return [];

  const raw = env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (!raw) return [];

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return [];
  }

  // https only. An http origin here would both leak analytics traffic and
  // be blocked by upgrade-insecure-requests anyway.
  if (url.protocol !== 'https:') return [];

  return [url.origin];
}

export function buildCsp(
  nonce: string,
  env: Record<string, string | undefined>,
): string {
  const connect = ["'self'", ...analyticsOrigins(env)].join(' ');

  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src ${connect}`,
    `media-src 'self'`,
    `worker-src 'self' blob:`, // three.js/R3F workers
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

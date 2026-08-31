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
  // blob: is required by the KTX2 transcoder, which hands its decoded
  // texture back through a blob URL that three then fetches. Without it the
  // model loads, the geometry draws, and the monitor screen is silently
  // untextured — the browser logs "Refused to connect to blob:" and nothing
  // else surfaces. It is not a widening of trust: a blob URL is created by
  // this page, is same-origin by construction, and cannot address a remote
  // host, so no data can leave the origin through it.
  const connect = ["'self'", 'blob:', ...analyticsOrigins(env)].join(' ');

  return [
    `default-src 'self'`,
    // 'wasm-unsafe-eval' is NOT 'unsafe-eval'. It permits exactly one
    // thing — compiling and instantiating WebAssembly — and grants no
    // ability to eval() JavaScript, which is the capability that actually
    // matters for script injection. The hero model's geometry decoder is
    // WebAssembly, so without this Chrome blocks WebAssembly.instantiate
    // and the model silently never appears.
    //
    // Keeping full 'unsafe-eval' out is what forced the asset pipeline to
    // meshopt: Draco and KTX2 both decode through Emscripten embind, which
    // calls `new Function`, and neither can run under this policy. The gate
    // that used to require them is corrected in budgets.json. See
    // docs/08-security.md and components/3d/HeroScene.tsx.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src ${connect}`,
    `media-src 'self'`,
    // The ONLY third-party host in this policy, and it is a frame rather
    // than a script or a connection — youtube-nocookie can render inside
    // that frame under its own origin's rules, and can reach nothing in
    // this page. It exists for one partner video on the homepage.
    //
    // components/site/VideoEmbed.tsx does not create the iframe until the
    // visitor presses play, so on a normal page load this directive
    // permits something that never happens. That distinction is what keeps
    // /privacy honest: we do not involve a third party on the visitor's
    // behalf, they choose to.
    `frame-src https://www.youtube-nocookie.com`,
    `worker-src 'self' blob:`, // three.js/R3F workers
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

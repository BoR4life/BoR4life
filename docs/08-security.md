# Security

The brief was "extremely secure." This documents what is actually
implemented and verified, what is deliberately not done, and what remains
before the site is production-exposed. Claims here are tested, not aspirational.

## Threat model

The site is **a static marketing site with no user accounts, no database, no
payment flow, and no user-generated content.** That eliminates most of the
OWASP Top 10 by construction — there is no SQL, no authentication, no
session to hijack, no authorization boundary to escalate across.

What is actually at risk:

1. **Script injection (XSS)** — the one class that genuinely applies, via a
   dependency compromise or a future CMS integration.
2. **Supply chain** — by far the largest real risk. A marketing site pulls
   hundreds of transitive npm packages; any one can ship malicious code.
3. **Clickjacking / framing** — a cloned site framing this one to harvest
   enquiry-form submissions.
4. **Data leakage via analytics** — the most likely real incident. Visitors
   are clinicians and procurement staff; session recording that captures
   what they type is a genuine data-handling problem.
5. **Transport downgrade** — a visitor on hospital wifi hitting HTTP.

## What is implemented

### Content Security Policy — strict, nonce-based

`middleware.ts` generates a fresh nonce per request. **No `'unsafe-inline'`,
no `'unsafe-eval'`** anywhere in the policy — this is the actual boundary
against injected scripts, and the reason the rest of the header list is
supporting rather than primary.

```
default-src 'self'; script-src 'self' 'nonce-<per-request>' 'strict-dynamic';
style-src 'self' 'nonce-...'; img-src 'self' data:; font-src 'self';
connect-src 'self'; media-src 'self'; worker-src 'self' blob:;
frame-ancestors 'none'; base-uri 'self'; form-action 'self';
object-src 'none'; upgrade-insecure-requests
```

`connect-src 'self'` means the browser cannot reach any third-party host.
**This caught a real bug during the build:** drei's `<Environment preset>`
silently fetches an HDRI from `raw.githack.com` at runtime — an undeclared
third-party dependency and a privacy leak (every visitor's IP reaching that
CDN). It was removed in favour of local lights. Widen `connect-src`
deliberately and never as a quick fix for a blocked request.

### Response headers

Set once in `next.config.mjs`; verified live with `curl -I`.

| Header | Value | Why |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Two years, subdomains, preload-eligible. **Only enable once the production domain serves HTTPS correctly on every subdomain** — this is hard to undo. |
| `X-Frame-Options` | `DENY` | Clickjacking. Belt-and-braces with `frame-ancestors 'none'`. |
| `X-Content-Type-Options` | `nosniff` | Stops MIME confusion attacks. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Don't leak full URLs to third parties. |
| `Permissions-Policy` | camera/mic/geo/payment/usb denied | Deny every capability the site doesn't use. |
| `X-Powered-By` | *removed* (`poweredByHeader: false`) | Don't advertise framework version to scanners. |

### Supply chain

- `npm audit` reports **0 vulnerabilities**, verified.
- **Next.js was upgraded 15.5.4 → 15.5.24** during setup: npm flagged
  CVE-2025-66478 in the version originally pinned.
- `sharp` and `postcss` are pinned via `overrides` to patched releases —
  `sharp` matters because it processes untrusted image bytes at runtime, and
  the vulnerable range inherited four libvips CVEs.
- `eslint-plugin-security` runs in CI via `npm run lint`.
- `npm run audit` (`--omit=dev --audit-level=high`) is wired as a script and
  belongs in CI.

### Analytics privacy

`components/analytics/PostHogProvider.tsx` inverts PostHog's defaults:

- `maskAllInputs: true` and `maskTextSelector: '*'` — **every** input value
  and text node is masked in session recordings. PostHog's default records
  input values; a single unmasked field on a healthcare site is an incident.
- `autocapture.element_allowlist` limited to `button`/`a`, so element text
  (which can contain names and institutions) is never captured.
- `persistence: 'memory'` — cookieless, nothing stored on the device.
- `respect_dnt: true`.
- `sanitize_properties` strips query strings and fragments from all URL
  properties, rebuilt immutably rather than mutated in place.
- **Analytics does not initialise at all unless `NEXT_PUBLIC_POSTHOG_KEY`
  is set.** There is no default project key, so a fork cannot silently send
  data somewhere unintended.

Use the **EU host** (`https://eu.i.posthog.com`) if data residency matters
to institutional customers — for AU/UK/EU health buyers it usually does.

## Deliberately NOT done, and why

- **No CORS configuration.** The site exposes no API, so there is nothing to
  configure. Adding permissive CORS headers "for safety" would create
  exposure, not remove it.
- **No rate limiting yet.** Nothing accepts input. Required the moment an
  enquiry form ships — see below.
- **No CSRF tokens.** No state-changing endpoints exist.
- **No WAF / bot protection.** Appropriate at the hosting layer (Vercel/
  Cloudflare), not in application code.

## Before production

- [ ] **Enquiry form**: server-side validation (zod is installed), rate
      limiting, and a spam control that is not a third-party script — a
      hidden honeypot field keeps `connect-src` closed.
- [ ] Confirm HTTPS on every subdomain **before** the HSTS preload takes hold.
- [ ] Add `npm run audit` and `npm run verify` to CI as blocking checks.
- [ ] Enable Dependabot or Renovate for automated dependency patching.
- [ ] Set `NEXT_PUBLIC_SITE_URL` in the production environment — without it
      OG image URLs silently fall back to localhost.
- [ ] Add `security.txt` under `/.well-known/` with a disclosure contact.
- [ ] Re-run `npm audit` at deploy time, not just at build time.

## Verified, not assumed

```bash
npm run verify        # typecheck + lint + asset budgets + build
npm run audit         # production dependencies, high severity
npx playwright test   # axe WCAG 2.2 AA + reduced-motion behaviour
curl -I https://…     # confirm headers survive the hosting layer
```

The last one matters: some hosts strip or override security headers. Always
verify against the deployed URL, not just locally.

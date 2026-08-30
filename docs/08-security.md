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

`middleware.ts` generates a fresh nonce per request using **Web Crypto and
`btoa`, never Node's `Buffer`**. Middleware runs in the Edge Runtime, where
`Buffer` does not exist — but the local dev sandbox provides it, so
`Buffer.from(...)` builds and runs perfectly on a laptop and then fails only
once deployed. That mistake broke the first Vercel deployments and is now
covered by `tests/csp.spec.ts`. **No `'unsafe-inline'`,
no `'unsafe-eval'`** anywhere in the policy — this is the actual boundary
against injected scripts, and the reason the rest of the header list is
supporting rather than primary.

```
default-src 'self';
script-src 'self' 'nonce-<per-request>' 'strict-dynamic' 'wasm-unsafe-eval';
style-src 'self' 'nonce-...'; img-src 'self' data:; font-src 'self';
connect-src 'self' blob: [analytics origin, only when configured];
media-src 'self'; worker-src 'self' blob:;
frame-ancestors 'none'; base-uri 'self'; form-action 'self';
object-src 'none'; upgrade-insecure-requests
```

### `'wasm-unsafe-eval'`, and what it cost the 3D pipeline

`'wasm-unsafe-eval'` is **not** `'unsafe-eval'`. It permits compiling and
instantiating WebAssembly and nothing else — no `eval()`, no
`new Function()`. The hero model's geometry decoder is WebAssembly, so
without it Chrome blocks `WebAssembly.instantiate` and the model never
renders.

Holding the line on full `'unsafe-eval'` is what dictated the asset format,
and this is the least obvious constraint in the whole repository:

**Draco and KTX2/Basis cannot be used on this site.** Both decoders are
Emscripten *embind* builds, and embind constructs its invoker functions at
runtime with `new Function` — `craftInvokerFunction` in the Emscripten glue.
Under this CSP that throws `EvalError` inside the decoder worker. The
failure is completely silent: the poster underneath the canvas keeps
rendering, the page looks correct, the build passes, and nothing anywhere
reports the loss.

So geometry is **meshopt** (`EXT_meshopt_compression`), whose decoder is
hand-written, contains no `eval`, and embeds its own WebAssembly as base64 —
meaning there is no decoder file to host and no CDN fetch. Textures are not
supercompressed at all; GPU memory is controlled by clamping dimensions
instead, which is what `maxGpuTextureMb` in `budgets.json` now measures.

`budgets.json` used to *require* `KHR_draco_mesh_compression` and
`KHR_texture_basisu`. That gate was unsatisfiable on this site — it demanded
a format the site's own security policy forbids decoding. It has been
corrected rather than relaxed.

**Never point a loader at a CDN to fix a decoder problem.** three's
`DRACOLoader` and drei's `useGLTF` both default to Google's gstatic
endpoint. That would be the same mistake as drei's `<Environment preset>`
fetching an HDRI from `raw.githack.com`: an undeclared third-party
dependency and every visitor's IP reaching a third party from a healthcare
vendor's site.

### `connect-src blob:`

Required by three's decoder workers, which pass data back through blob URLs.
Not a widening of trust: a blob URL is minted by the page, is same-origin by
construction, and cannot address a remote host, so nothing can leave the
origin through it. `tests/csp-build.spec.ts` asserts no `http(s)` source ever
appears in `connect-src` except a deliberately configured analytics origin.

### Inline styles are refused, and that broke first paint

`style-src 'self' 'nonce-...'` refuses inline `style="..."` attributes, and a
CSP nonce **cannot** be attached to a style attribute — the browser says so
explicitly. React `style` props are server-rendered by Next.js as exactly
those attributes, so every one of them was silently dropped until hydration.

On the homepage that was 28 refusals, and it mattered: the scroll
narrative's three stacked frames all rendered at their CSS default opacity,
so the last in DOM order covered the opening frame for the entire
pre-hydration window — the LCP window the narrative exists to fill. Fixed by
moving to utility classes, which the stylesheet applies at first paint.

**Rule: no `style` prop on anything whose appearance must be correct before
JavaScript runs.** Use a class. `tests/hero3d.spec.ts` and the a11y suite
would not have caught this; it was found by reading console output.

`connect-src 'self'` means the browser cannot reach any third-party host.
**This caught a real bug during the build:** drei's `<Environment preset>`
silently fetches an HDRI from `raw.githack.com` at runtime — an undeclared
third-party dependency and a privacy leak (every visitor's IP reaching that
CDN). It was removed in favour of local lights. Widen `connect-src`
deliberately and never as a quick fix for a blocked request.

**The one configured exception.** `connect-src` gains exactly one origin —
the configured PostHog host — and only when `NEXT_PUBLIC_POSTHOG_KEY` is
also set. This was itself a latent bug: the policy was `'self'` only while
`PostHogProvider` was free to initialise, so setting the key produced a
site where analytics ran and had every request refused by the browser. That
fails *silently* — no server log, no visible error, just an empty dashboard
and a false belief that traffic is measured.

The allow-list is built in `lib/csp.ts` and hardened against its own inputs:
the host is parsed with `new URL()`, reduced to a bare origin (a path in a
CSP source expression is matched as a prefix and would not match the real
request URLs), rejected unless it is `https:`, and dropped entirely if it
does not parse — so an env var can never inject a `;` and rewrite the rest
of the policy. `tests/csp-build.spec.ts` covers each of those cases; it is
a unit test precisely because these configurations are not the one the dev
server runs under.

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

### The published statements

`/privacy` and `/accessibility` are written *from this implementation*, not
from a template, and both name the files that make each claim true. That is
a maintenance obligation, not a stylistic flourish: **if the behaviour
changes, the page changes in the same commit.** A privacy notice that has
drifted from the code is not merely stale — it is a written
misrepresentation to a health-sector buyer, and it is the document they are
most likely to check against observed behaviour.

Specifically, changing any of the following requires editing
`app/privacy/page.tsx`:

- `persistence`, `maskAllInputs`, `maskTextSelector`, `respect_dnt`,
  `element_allowlist` or `sanitize_properties` in `PostHogProvider.tsx`
- the `connect-src` allow-list in `lib/csp.ts`
- the field list in `EnquirySchema` (`lib/enquiry.ts`)
- the delivery provider or its processing region (`app/contact/actions.ts`)
- whether `lib/rate-limit.ts` persists anything beyond process memory

And changing the a11y gate, the reduced-motion path, or the manual
pre-release checks requires editing `app/accessibility/page.tsx`.

`/resources` deliberately publishes **no certification claims**. Add a
standard to that page only once we have actually been assessed against it.

## Deliberately NOT done, and why

- **No CORS configuration.** The site exposes no API, so there is nothing to
  configure. Adding permissive CORS headers "for safety" would create
  exposure, not remove it.
- **No rate limiting yet.** Nothing accepts input. Required the moment an
  enquiry form ships — see below.
- **No CSRF tokens.** No state-changing endpoints exist.
- **No WAF / bot protection.** Appropriate at the hosting layer (Vercel/
  Cloudflare), not in application code.

## Enquiry form — the only untrusted-input surface

Implemented as a **Server Action**, not a route handler: Next.js binds
Server Actions to an origin-checked POST with their own action ID, which
removes the CSRF surface a hand-rolled `/api` endpoint would have.

Controls, in execution order:

1. **Rate limit** — 5 submissions per IP per 10 minutes. See the scope
   caveat in `lib/rate-limit.ts`: state is per-process, so it does not
   hold across serverless instances. Adequate here alongside the other
   controls; swap for Upstash/Redis before the form ever becomes a login.
2. **Schema validation** (zod), server-side. Client validation is a
   convenience, never the boundary.
3. **Honeypot + timing** — a visually-hidden (not `type="hidden"`) field
   bots fill, plus a sub-2s submit check. Both answer with the same
   success response a human gets; telling a spammer what caught them just
   teaches them what to change.

**Ordering bug found by testing:** the bot checks originally ran *before*
validation, which meant a human clicking submit on an empty form within
two seconds got a fake success instead of field errors. Validation now
runs first. Covered by `tests/enquiry.spec.ts`.

Field errors accumulate into a `Map` rather than an object literal —
zod's issue paths are schema-derived and not attacker-controlled, but
assigning a computed key onto an object is a prototype-pollution shape
and there is no reason to keep it.

Delivery is a **vendor-neutral adapter** (`ENQUIRY_WEBHOOK_URL`). No email
provider is committed to, because that choice affects data residency and
is Brad's to make — for AU/UK/EU health buyers it usually matters.

## Before production

- [ ] Choose an email/delivery provider and set `ENQUIRY_WEBHOOK_URL`.
      Until then enquiries are logged (without PII) and **not delivered**.
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

## Deployment notes

`vercel.json` deliberately does **not** pin a region. It originally set
`regions: ["syd1"]` for latency to Australian users, but region selection is
plan-gated on Vercel and the first deployment failed config validation in
about forty seconds — too fast to have been a compile error. If the account
moves to a plan that allows it, re-adding `syd1` is worthwhile: most of the
audience is in Australia and the difference is real.

Long-lived immutable caching is applied to media by extension. Every one of
those assets is content-addressed by filename via the render pipeline, so a
changed asset gets a changed name and the year-long cache is safe.

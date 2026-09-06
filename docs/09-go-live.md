# Go-live runbook

Everything between "the pull request is merged" and "the site is live on
`bundleofrays.com`", in the order it has to happen. Written as a runbook
because the risky steps are the boring ones, and two of them can break
email that has been working for five years.

---

## The domain decision

**`bundleofrays.com` is the canonical domain, for the website and for
email. It is not being changed.**

The question that prompted this was whether to move to something shorter —
`BoR` or similar — because "Bundle of Rays" is long in an email address.
The instinct is reasonable and the answer is still no:

- **Sending reputation is the real cost.** Mail from this business goes to
  `health.qld.gov.au`, `.edu.au` and `osu.edu`. Government and university
  gateways are the most aggressive filters in existence. A five-year-old
  domain with clean history passes; a domain registered last month does not,
  and it fails *silently* — quarantined, not bounced. You would simply
  conclude people were slow to reply.
- **Five years of Queensland Health records point at it** — supplier
  databases, contracts, invoices, individual address books. Changing it
  means re-verification through a procurement system that took years to
  enter.
- **Domain age is itself a diligence signal**, to spam filters and to a
  procurement officer checking who they are about to contract with.
- **`bor.com` is a three-letter .com.** Registered, and priced in the
  aftermarket accordingly. Lowercase in a URL it reads as "bore". And in US
  higher education **BOR means Board of Regents** — a live collision given
  Ohio State, not a hypothetical one.
- For scale: `brad@bundleofrays.com` is 22 characters. The people receiving
  it have addresses like `firstname.lastname@health.qld.gov.au`.

If a short domain is wanted for a business card or to say on a call,
register one and make it a **301 redirect** to `bundleofrays.com`. Never
serve the site from both — duplicate content across two live origins splits
search ranking and confuses buyers about which is real. Never send email
from it.

In the code this lives in exactly one place: the `FALLBACK` constant in
`lib/site.ts`, plus the `NEXT_PUBLIC_SITE_URL` environment variable. It is a
configuration decision, not a code change.

---

## Order of operations

### 1. Merge, and point production at `main`

The Vercel project's **Production Branch** currently points at the feature
branch. Until that is changed, merging to `main` deploys nothing.

- Vercel → Project → Settings → Git → Production Branch → `main`
- Merge the pull request.

### 2. Set `NEXT_PUBLIC_SITE_URL`

```
NEXT_PUBLIC_SITE_URL=https://www.bundleofrays.com
```

Set it for **Production**. Either a real value or no variable at all — an
empty value is what crashed four consecutive deployments, and while
`lib/site.ts` now survives it, an empty variable still silently ships the
fallback rather than what you meant.

`www` rather than the apex, because that is what the existing site uses and
what the code falls back to. Whichever is chosen, the other must redirect to
it, not serve a copy.

### 3. Email: send from a subdomain, and do not touch the root SPF record

**This is the step that can break existing mail.** Read it before touching
DNS.

Resend asks you to verify a sending domain, which means adding DNS records.
The obvious move is to verify `bundleofrays.com` itself. Do not.

> **A domain may have exactly one SPF record.** If you already publish one
> at the root for your existing mail provider — and you do, or your mail
> would not be delivering — adding a second SPF TXT record does not add to
> it. It produces a `permerror`, and SPF then fails for **all** mail from
> the domain, including yours to Queensland Health. Multiple SPF records is
> among the most common self-inflicted mail outages there is.

Verify a **subdomain** instead:

```
ENQUIRY_FROM_EMAIL=website@send.bundleofrays.com
ENQUIRY_TO_EMAIL=brad@bundleofrays.com
RESEND_API_KEY=re_...
```

Resend's SPF, DKIM and DMARC records then go under `send.bundleofrays.com`,
where there is no existing record to collide with. Two further benefits fall
out of it:

- **Reputation isolation.** If the enquiry form is ever abused, the damage
  is contained to the sending subdomain. Your personal mail reputation is
  untouched.
- The `From` address is plainly a website address, while `Reply-To` is
  already set to the enquirer (`app/contact/actions.ts`), so replying
  behaves exactly as you would want.

**Your MX records do not change at any point.** Nothing in this runbook
moves your inbox.

Until this is configured, enquiries are logged without PII and **not
delivered**. The form will appear to work. Test it end to end after
configuring, with a real submission, and confirm the mail arrives.

> `/privacy` names Resend as the processor and states that it processes in
> the United States. If you choose a different provider, that page must
> change in the same release — see `docs/08-security.md`.

### 4. DNS cutover

Point `www.bundleofrays.com` at Vercel, per the records Vercel shows for the
domain. Add the apex too, redirecting to `www`.

Do this **after** steps 1–3, because it is the step that makes the new site
live to the public. Everything before it is reversible in a click.

### 5. HSTS — check this before, not after

`next.config.mjs` ships:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Two years, **all subdomains**, and preload-eligible. Once a browser sees it,
that browser will refuse plain HTTP to `bundleofrays.com` *and every
subdomain* for two years, and removal from the preload list takes months.

Before the cutover, confirm every subdomain you use serves valid HTTPS —
anything on plain HTTP will become unreachable, not merely insecure. If
anything is uncertain, drop `preload` for the first few weeks and add it
once the estate is confirmed. `includeSubDomains` without `preload` is still
strong and is far easier to walk back.

---

## After go-live

- Submit the sitemap (`/sitemap.xml`) to Google Search Console.
- Send a real enquiry through the form and confirm it arrives.
- Open the homepage on a phone and confirm the scenario clip plays and the
  Bodyswaps video loads only after you press play.
- If analytics are wanted, set `NEXT_PUBLIC_POSTHOG_KEY` and
  `NEXT_PUBLIC_POSTHOG_HOST` together. Neither alone does anything, and the
  CSP widens to that one origin only when both are present (`lib/csp.ts`).

## Known, deliberately not done

- **Static assets are not content-hashed.** Images and video ship under
  stable filenames, so aggressive `immutable` caching would serve a stale
  file to returning visitors after an update. Vercel's revalidating
  default is correct until the filenames carry a content hash. Do not add
  `immutable` caching without doing that first.
- **No independent accessibility audit.** `/accessibility` says so plainly
  rather than implying one exists.
- **Model releases for `team-learning-development.*` are unsighted.** Six
  identifiable adults. Confirm consent before this reaches a production
  domain — see `docs/asset-licences.md`.
- **South West HHS have not been told we quote their newsletter.** The
  sentence on `/evidence` comes from a public document and is cited to the
  issue, which is defensible on its own. But a government health service
  generally expects to be asked before a supplier quotes its publication in
  marketing, the ask costs one short email, and being caught not asking costs
  a great deal more with that kind of client. Send it before the cutover, and
  it is a natural opening to request a current quote — the article is five
  years old.

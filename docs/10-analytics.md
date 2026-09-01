# Analytics: what the site tracks, and how to read it

Brad asked for "analytics to track the business". This is what that means
here, in two layers, and what to do with each.

---

## Layer 1 — every enquiry says where it came from

This is the part that needs no dashboard, no account and no setup. It is on
by default and it is the most useful number the site produces.

Every enquiry email ends with a block like this:

```
— Where this lead came from —
Location:     Queensland, AU
Came from:    www.linkedin.com
Campaign:     source=linkedin  medium=post  campaign=sept-launch
Landed on:    /solutions
Read first:   /solutions → /solutions/nursing → /evidence
```

Read it the way a sales lead reads a business card. Over a month the
pattern answers the questions that decide where effort goes:

- **"Is LinkedIn working?"** — count enquiries whose *Came from* is
  `linkedin.com`.
- **"Did the conference talk generate anything?"** — tag the link on the
  slide `?utm_source=conference&utm_campaign=hisa-2026` and every enquiry
  that came through it says so.
- **"Which page convinces people?"** — *Read first* shows the path. If
  `/evidence` keeps appearing right before `/contact`, that page is doing
  the work.
- **"Which market?"** — *Location* comes from the connection, server-side.

### Tagging links

Any link you put anywhere — a post, an email signature, a slide, a
partner's site — can carry a campaign tag. Add to the end of the address:

```
https://www.bundleofrays.com/?utm_source=linkedin&utm_medium=post&utm_campaign=sept-launch
```

`source` is *where* (linkedin, email, conference, partner-name),
`medium` is *how* (post, signature, slide, referral), `campaign` is *what*
(a name you will recognise in three months). Tag consistently and the
enquiry block becomes a ledger.

What it deliberately does **not** capture: the full address of the
referring page (host only), anything typed, anything about the person
beyond the country their connection came from. It is stored nowhere except
inside the enquiry email. `/privacy` describes it.

Implementation: `lib/lead-source.ts`, tested end to end in
`tests/lead-source.spec.ts`.

---

## Layer 2 — traffic, and returning visitors

For the aggregate view — how many people, which pages, from where, and
whether the person who read the evidence page in July came back in
September — the site is wired for PostHog. It is **off until the keys are
set**; the site behaves identically without it.

### Turn it on

1. Create a PostHog project. **Choose the EU region** (`eu.i.posthog.com`)
   — for AU, UK and EU health buyers the data-residency question comes up,
   and EU is the answer that satisfies the most of them.
2. In Vercel → Environment Variables, Production:

   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_...
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```

   Both, or neither. One alone does nothing, on purpose.
3. Redeploy.

The security policy widens to that one origin, only when both are present
(`lib/csp.ts`). No other third party is reachable from the page.

### What it records, and what it refuses to

Configured in `components/analytics/PostHogProvider.tsx` with every privacy
default inverted from the vendor's:

| Records | Never records |
|---|---|
| Page views, and the path between them | Anything typed into any field |
| Clicks on links and buttons | The text of what was clicked |
| Country and region | Precise location |
| A returning visitor, via one anonymous id in local storage | A name, an email, or anything that links to one |
| The `enquiry_sent` event with the *role* chosen | The enquiry's content |
| Referrer host and campaign tags | The referring page's full address |

Do Not Track is respected. Session recordings, if ever enabled, mask every
input and every text node.

The **anonymous id in local storage** is the one change from the original
build, made for this request. It is not a cookie: it is never sent to
another site and cannot follow anyone across the web. It exists so the
dashboard can say "returning" instead of counting the same person as new
every visit — which, for a site existing customers come back to, is most of
what the numbers are for. `/privacy` says exactly this.

### The three views worth building first

Once data is flowing, PostHog's Insights page. Build these and ignore the
rest for a month:

1. **Enquiries by source** — event `enquiry_sent`, broken down by
   `$referring_domain` and `utm_source`. This is Layer 1 as a chart.
2. **Path to enquiry** — a funnel: any page view → `/evidence` or
   `/solutions/*` → `/contact` → `enquiry_sent`. Where people drop is where
   the copy is failing.
3. **New vs returning, by week** — the trend that tells you whether warm
   customers actually use the site as the communication channel it is
   meant to be. If returning stays near zero, `/customers` needs to be in
   your onboarding email.

### What it will not tell you

Which *organisation* a visitor is from. Reverse-IP tools that claim to
("someone from Queensland Health viewed your pricing page") are a
third-party script and a privacy posture this site does not have. The
enquiry form is where that information arrives, when the person chooses
to give it.

# Working rules for this repository

Read this before changing anything. Every rule below exists because
ignoring it has already cost a day of work here, and each names the
incident it came from.

## 1. This repository is PUBLIC

`BoR4life/BoR4life` is world-readable, and its default branch is what
github.com/BoR4life/BoR4life shows a visitor.

So: **never write a client, partner or institution name into a tracked
file when the point of mentioning it is that it may not be published.** A
comment reading "we do not name X because of an NDA with X" discloses both
the relationship and the agreement — it is worse than silence and worse
than the plain fact. This happened: prohibitions naming two organisations
sat in `docs/`, `README.md`, and three source comments for three days.

The names live in `docs/constraints.local.md`, which is untracked and
listed in `.gitignore`. Tracked files state the rule abstractly ("an
institution Brad has asked us not to name"). `tests/prohibited.spec.ts`
enforces this and skips loudly where the local file is absent.

The same applies to commit messages, branch names, and pull request titles
and bodies. Those are public too.

## 2. Facts about the business come from Brad, never from a document

Client names, relationship lengths, titles, testimonials and outcome
figures are only published once Brad has confirmed them in writing. Do not
promote something found in a Drive file, a transcript or an old deck into
site copy — those documents contain drafts, third-party material and
things under agreement. If a fact is needed and unconfirmed, leave the gap
and ask.

**No efficacy percentage is published without a citation to a published
source.** No exceptions, including figures that appear in public coverage.

## 3. The Content-Security-Policy is strict, and it is load-bearing

`lib/csp.ts` sets a nonce-based policy: no `unsafe-inline`, no
`unsafe-eval`, no `wasm-unsafe-eval`, `connect-src 'self'` plus the
analytics origin only when both PostHog variables are set.

Two consequences that have each broken a build:

- **Inline `style` props are refused.** `style-src` cannot carry a nonce on
  a style *attribute*, so an SSR-rendered `style={{...}}` is blocked and
  the element renders unstyled. Use utility classes for anything that must
  be correct at first paint.
- **Anything compiled through Emscripten embind will not run.** It calls
  `new Function`. This is why Draco and KTX2 decoding was abandoned; only
  meshopt worked. Do not add a dependency with a WASM decoder without
  testing it against the real policy first.

`tests/csp-build.spec.ts` asserts the policy has not been widened.

## 4. Design tokens only

Colour, type and spacing come from `app/globals.css` and
`tailwind.config.ts`. Never write a hex value in a component.
`tests/contrast.spec.ts` proves every pairing by calculation, not by eye —
it exists because a border colour was used as footer text at 1.9:1 across
five pages and looked fine to everyone who looked at it.

The site is dark-only, deliberately. See the comment at the top of
`app/globals.css`.

## 5. Accessibility is a gate, not a review step

`npm run test` runs axe against every route and the build fails on a single
violation. But **axe finds roughly 40% of real problems**, and the two most
recent defects here were both invisible to it:

- the skip link scrolled the page without moving focus, because `<main>`
  had no `tabIndex={-1}` — it appeared to work and did nothing
  (`components/site/Main.tsx`, `tests/skip-link.spec.ts`);
- focus and anchor targets landed under the sticky header, fixed with
  `scroll-padding-top` in `app/globals.css`.

When you touch focus, scroll or the header, test the keyboard path
yourself. Never add an accessibility overlay or widget.

## 6. The enquiry form is the only conversion point

React 19 resets an uncontrolled form once its action completes, including
on failure. `app/contact/actions.ts` echoes the submitted values back and
the fields are keyed by attempt so nothing typed is ever lost;
`tests/form-recovery.spec.ts` fails if that regresses. Treat any change
here as high-risk and run that spec.

## 7. Prove it before pushing

`npm run verify` (typecheck, lint, asset budgets), `npm audit`, then
`npm run test`. CI runs the same two jobs and nothing merges red. A test
that passes without asserting anything is worse than no test — this repo
has shipped one (a screenshot of a transparent canvas), so assert on
something that can only be true if the feature works.

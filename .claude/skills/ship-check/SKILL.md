---
name: ship-check
description: Run the full pre-deploy gate — performance, accessibility, SEO and asset budgets — and return a pass/fail verdict. Use before any deploy and after any change affecting load, motion or markup.
---

# Ship Check

Delegate to the `quality-auditor` subagent, or run it directly.

```bash
npm run verify       # typecheck + lint + build + asset budgets
npm run analyze      # bundle composition — confirm three.js is NOT in the initial chunk
npm run lighthouse   # perf / a11y / best-practices / SEO, mobile and desktop
npm run a11y         # axe-core across every route
```

## Manual checks the tools cannot do

Automated a11y tooling catches roughly 40% of real problems. Verify by hand:

- **Keyboard** — tab the whole page. Everything reachable, focus always
  visible, order logical, no traps.
- **Reduced motion** — every loop frozen to its poster, no scroll-scrub, no
  parallax, page still coherent.
- **Video blocked** — the scenario clip shows its poster; the page is complete without it.
- **JavaScript disabled** — content readable, nav usable.
- **LCP element** — confirm it is the hero heading, not an image and not
  a late font.
- **Content parity** — no fact exists only inside a video or an image.

## Verdict

**PASS** or **FAIL** first. Then metric / budget / measured / delta. Then the
specific cause and fix for each failure.

A near-miss is a FAIL — `budgets.json` already contains the tolerance. Never
widen a budget to turn a FAIL into a PASS; that is Brad's decision, made
explicitly.

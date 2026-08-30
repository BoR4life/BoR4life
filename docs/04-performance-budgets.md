# Performance & Accessibility Budgets

Numbers live in `budgets.json` — that file is the single source of truth and
the validator reads it directly. This document explains *why* each number is
what it is, so the agent can reason about trade-offs instead of guessing.

## Why budgets at all

A "world class" site is not one that looked beautiful the week it launched. It
is one that is still fast three years and two hundred commits later. That only
happens if degradation is mechanically blocked, because every individual
regression is always locally reasonable — one more font, one more tracking
script, one more 400KB image "just this once".

The gate is the mechanism. `budgets.json` + `scripts/validate-assets.mjs` +
CI is what turns "we care about performance" into something that actually holds.

## The numbers, explained

| Budget | Value | Reasoning |
|---|---|---|
| LCP | 2000ms | Google's "good" threshold is 2500ms. We take 500ms of headroom because our LCP is a large 3D still and it degrades on real networks. |
| INP | 200ms | Threshold for "good". WebGL competing for the main thread is the risk; `frameloop="demand"` protects it. |
| CLS | 0.05 | Half the 0.1 threshold. With full-bleed media and a webfont, drift is easy — the tight budget forces reserved aspect-ratio boxes and preloaded fonts. |
| Initial JS | 180KB gz | A mid-tier Android takes ~1s just to parse and execute 180KB. Three.js alone is ~150KB gz, which is exactly why it must be a lazy chunk. |
| 3D chunk | 350KB gz | three + r3f + a narrow drei import. If this is exceeded, someone imported all of drei — import per-module. |
| Hero glTF | 2MB | After Draco + KTX2, a well-authored clinical scene lands at 1.2–1.8MB. Above 2MB means it was authored too heavy. |
| Hero triangles | 150k | Comfortable for integrated graphics at 60fps. Beyond this, mobile drops frames before it runs out of memory. |
| Draw calls | 80 | Each is CPU overhead. Merging meshes and atlasing materials is far cheaper than reducing polygons. |
| AVIF still | 250KB | At 2400px this is achievable for a path-traced render at quality that survives a 5K display. |
| AV1 loop | 1.5MB | A 4–6s muted loop at 1080p. Beyond this the loop is too long, not too detailed — shorten it. |
| Lighthouse a11y | 100 | Not 95. The automated portion of accessibility is the easy portion; failing it is inexcusable for a healthcare vendor. |

## Accessibility is scope, not polish

Bundle of Rays sells to health departments and universities. Two consequences:

1. **Procurement will ask.** Public-sector buyers in AU, UK and US have
   accessibility obligations they pass to vendors. An inaccessible site is a
   commercial problem before it is an ethical one.
2. **The credibility asymmetry is brutal.** A company whose entire pitch is
   "we make learning accessible to more people through immersion" cannot ship
   a website that excludes screen-reader users, keyboard users, or people with
   vestibular disorders. It undermines the product claim itself.

Hard rules, enforced at the gate:

- Zero axe violations. WCAG 2.2 AA.
- No content exists only inside a canvas or only in an image.
- `prefers-reduced-motion: reduce` is fully honoured — this is a medical
  consideration, not a stylistic one. Vestibular disorders are common, and
  scroll-jacked camera motion can cause genuine nausea.
- Everything keyboard-operable with visible focus.
- The site works with JavaScript off, WebGL unavailable, and motion reduced.

## When a budget genuinely needs to change

It happens. The process:

1. State what is being bought with the extra weight, in user-visible terms.
2. Measure the actual cost on a mid-tier Android over 4G — not on a MacBook.
3. Brad decides, explicitly.
4. Update `budgets.json` with a comment recording the reason.

What must never happen: an agent widening a budget so its own work passes.
That inverts the entire purpose of the gate.

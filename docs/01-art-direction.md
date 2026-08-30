# Art Direction

## The reference, and how to use it

Brad's reference is **mwinckelmann.com** — Matthias Winckelmann, Berlin-based
director/designer and realtime-CG artist, co-founder of someform Studio
(client work includes Samsung S24).

> Source note: the site could not be fetched from this build environment
> (egress policy). What follows is the craft vocabulary of the high-end
> realtime-CG portfolio genre, not a shot-by-shot audit. **The art-director
> agent must re-audit the live reference** — see `AUDIT-REFERENCE` in
> `.claude/skills/build-site/SKILL.md` — and reconcile this document against it
> before any visual work is signed off.

### What to take from it

- **CG carries the page; UI gets out of the way.** Full-bleed renders and
  loops are the content. Chrome is thin, monochrome and quiet.
- **One typeface, used with conviction.** A neo-grotesque at two extremes —
  very large display, very small caps-tracked labels — and almost nothing in
  between. Type discipline is what separates expensive from busy.
- **Near-monochrome ground.** Off-black or off-white. All chroma comes from
  the renders. This is why the 3D reads as premium: nothing competes with it.
- **Motion with a point of view.** Smooth scroll, scroll-linked reveals,
  weighted easing. Motion is slow, heavy and confident — never bouncy.
- **The case study is the atomic unit.** Hero loop → context → process → outcome.
- **Generous negative space** on an editorial grid.

### What NOT to take from it — read this before designing anything

A director's portfolio and a healthcare-procurement site have opposite jobs.

| Winckelmann's site | Bundle of Rays' site |
|---|---|
| Audience: creative directors hiring for craft | Audience: health departments and universities buying evidence |
| Success = "this person is talented" | Success = "this vendor is credible, compliant and proven" |
| Low information density is a feature | Low information density loses the procurement reader |
| Slow atmospheric reveal builds intrigue | Slow reveal makes a dean bounce before seeing the client list |
| Mystery is desirable | Mystery reads as evasive when public money is involved |

Copying the aesthetic wholesale produces a site that wins design awards and
loses tenders. **The synthesis is: Winckelmann's craft vocabulary on an
evidence-led information architecture.** Concretely:

- Cinematic hero, but the client logos and the accreditation sit **above the
  fold on desktop and within one scroll on mobile** — not buried at page end.
- Case studies get the full atmospheric treatment, and each one ends with a
  hard outcomes block: cohort size, measure, result, source.
- Every atmospheric section has a skimmable spine — a heading and one sentence
  that carries the meaning if the visitor reads nothing else and sees no motion.
- Nothing essential is gated behind scroll-driven animation. See the
  accessibility rules in `docs/04-performance-budgets.md`.

## Design system

### Colour

Near-monochrome shell, clinical accent. Chroma belongs to the renders.

```
--ink-900   #0A0C0F   page ground (dark mode / hero sections)
--ink-700   #16191F   raised surface
--ink-500   #3A414D   muted rule, disabled
--ink-300   #8B939F   secondary text on dark
--paper-100 #F4F5F7   page ground (light sections)
--paper-000 #FFFFFF   raised surface on light
--signal    #00E0B8   single accent — CTAs, data highlights, active state
--critical  #FF5A4E   clinical alert accent, used sparingly and never decoratively
```

One accent. `--signal` is a cool teal that reads as clinical-technical rather
than corporate-blue, and holds contrast on both grounds. Every pairing that
ships must clear the contrast ratios in `budgets.json` — the ship-check gate
tests this, so do not eyeball it.

`--critical` is reserved for genuine clinical-alert context inside product
imagery. Using it as a decorative accent cheapens it and confuses meaning.

### Typography

One family, two registers.

- **Display**: neo-grotesque, tight tracking (-0.02em to -0.04em), weights 400
  and 600 only. Clamp from 2.5rem to 7rem.
- **Micro**: same family, 0.75rem, uppercase, +0.12em tracking, for eyebrows,
  labels and data captions.
- **Body**: 1.0625rem, 1.6 line-height, max 68ch.

Self-host with `font-display: swap` and preload the display weight. A webfont
network round-trip is a top cause of LCP failure — see the budget gate.

### Motion

- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances. Weighted, no overshoot.
- Duration: 400–800ms for section reveals, 150–250ms for interface feedback.
- Scroll: smooth-scroll library permitted, but the page must remain fully
  usable and readable with it disabled.
- **`prefers-reduced-motion: reduce` is honoured everywhere.** All autoplay
  loops freeze to their poster frame, scroll-scrubbing is replaced by static
  layout, parallax is removed. This is a hard gate, not a nicety.

### Grid

12-column, 1440px max content width, 88px desktop gutter, 20px mobile.
Full-bleed media escapes the grid deliberately, never accidentally.

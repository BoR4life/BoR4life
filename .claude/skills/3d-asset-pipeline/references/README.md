# Reference implementations

The poster-first, capability-gated 3D pattern now lives in real, tested
application code rather than as a copy here:

| Concern | File |
|---|---|
| Poster-first hero, capability gate, lazy mount | `components/3d/HeroCanvas.tsx` |
| The single live WebGL scene | `components/3d/HeroScene.tsx` |
| WebGL2 / memory / save-data / reduced-motion detection | `lib/capability.ts` |

**Read those, not a copy.** Earlier versions of this directory held
near-identical `.tsx` files, which is a drift hazard: the copy silently
falls behind the implementation and then teaches the wrong pattern. The
application code is type-checked, linted and covered by
`tests/a11y.spec.ts`, so it cannot rot the same way.

Two constraints that are easy to lose and worth restating:

- **Never use drei's `<Environment preset="…">`.** It fetches an HDRI from
  a third-party CDN at runtime — an undeclared dependency, a privacy leak
  (every visitor's IP reaches that host), and a hard failure under the
  site's `connect-src 'self'` CSP. Use local lights.
- **Never use `next/image` for the hero poster.** It emits an inline style
  attribute that the strict `style-src` blocks. A `<picture>` element with
  the pre-encoded AVIF/WebP is both CSP-safe and lighter, since the render
  pipeline already produces both inside the asset budget.

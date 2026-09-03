import localFont from 'next/font/local';

/**
 * Inter Tight, self-hosted.
 *
 * Until now the site ran on a native stack — ui-sans-serif, system-ui,
 * Helvetica. That is a sound default and it was the right call while no face
 * was chosen, but on a site whose entire argument is carried by type it is
 * also the one thing a visitor reads as unfinished: the headline is the
 * largest element on every page and it had no voice of its own.
 *
 * Why this face. docs/01-art-direction.md specifies a neo-grotesque set
 * tight, at weights 400 and 600 only. Inter Tight is drawn for exactly that
 * — the display cut of a face designed for screen legibility, with the
 * narrower sidebearings that let a long headline set at -0.03em without the
 * letters colliding. It reads clinical-technical rather than
 * corporate-friendly, which is the register the brand needs in front of a
 * procurement reader.
 *
 * Why self-hosted rather than a Google Fonts link. Two reasons and both are
 * load-bearing here: `font-src 'self'` in lib/csp.ts stays closed, so no
 * third party is contacted on a visitor's behalf and /privacy stays true;
 * and the latin subset is 44KB per weight served from our own origin, with
 * no extra DNS and TLS round-trip on the critical path.
 *
 * `display: 'swap'` plus the metric overrides below mean text is readable
 * immediately in the fallback and reflows almost imperceptibly when the real
 * face arrives — a webfont round-trip is one of the top causes of a poor LCP
 * and the site has an asset budget to keep.
 *
 * Licence: SIL Open Font License 1.1. Permits web embedding, commercial use
 * and self-hosting. See docs/asset-licences.md.
 */
export const interTight = localFont({
  // ONE file, declaring the whole axis.
  //
  // This is a variable font — wght 100-900, nine named instances — and it
  // was previously listed three times as static 400, 500 and 600. Three
  // things about that are worth recording, because two of the obvious
  // conclusions are wrong and cost time to check:
  //
  //   - it was NOT faking bold. Chromium clamps a variable axis to the
  //     font-weight a face declares, so the three entries did render three
  //     genuinely different weights (measured: 703, 721 and 739px advance
  //     on the same string at 100px).
  //   - it was NOT shipping three times. next/font content-addresses the
  //     output, so three byte-identical sources deduped to a single 44KB
  //     request. The repo carried 90KB of redundant history; the browser
  //     never did.
  //   - what it DID cost is the rest of the axis, and worse than clamping.
  //     Restoring the three-cut declaration for one build to check
  //     (tests/variable-font.spec.ts fails three ways against it) showed
  //     `font-weight: 520` rendering byte-identically to 400, and a
  //     heading asking for 560 coming back as 700 — synthesised, not
  //     clamped. So the 500 steps between 100 and 900 that this file
  //     already contains were not merely unreachable at no saving; asking
  //     for one got you a fake.
  //
  // A range descriptor unlocks all of them for the same 44KB, which is what
  // the intermediate weights in tailwind.config.ts are for.
  src: [{ path: './InterTight.var.woff2', weight: '100 900', style: 'normal' }],
  display: 'swap',
  variable: '--font-display',
  // Tuned so the fallback occupies close to the same space as the real face,
  // which keeps the swap from shifting layout.
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

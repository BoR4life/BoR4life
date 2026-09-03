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
  src: [
    { path: './InterTight-400.woff2', weight: '400', style: 'normal' },
    { path: './InterTight-500.woff2', weight: '500', style: 'normal' },
    { path: './InterTight-600.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-display',
  // Tuned so the fallback occupies close to the same space as the real face,
  // which keeps the swap from shifting layout.
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

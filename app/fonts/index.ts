import localFont from 'next/font/local';

/**
 * Archivo for display and interface, Source Serif 4 for body and long-form.
 *
 * Both are specified by the brand kit, and the pairing is deliberately
 * inverted from the usual serif-display-over-sans-body. The reasoning is
 * the kit's and it is about audience, not taste: the people who decide here
 * are nurse educators, directors of nursing, deans, ethics committees and
 * procurement. They read documents for a living. A serif body reads as a
 * document rather than a marketing page, and that is the credibility move
 * with a reader who can identify a template at a glance.
 *
 * This replaces Inter Tight, which was chosen here before the brand kit
 * existed and had no authority behind it beyond being a good screen face.
 *
 * Both faces are variable and declared as ranges, so the whole axis is
 * reachable from one file each. Source Serif 4 also carries an `opsz` axis
 * (8 to 60) — genuine optical sizing, the thing a body serif most wants and
 * the reason it is worth its weight here.
 *
 * Weight, measured: Archivo 35KB, Source Serif 4 122KB, latin subsets.
 * That is 157KB against the 44KB the single previous face cost, and it is
 * the real price of this change. Both carry metric overrides and
 * `display: swap`, so text is readable immediately in the fallback and the
 * reflow when the real face lands is small rather than a jump.
 *
 * Licence: both SIL Open Font License 1.1 — Archivo by Omnibus-Type, Source
 * Serif by Adobe. Permits web embedding, commercial use and self-hosting.
 * Self-hosted rather than linked so `font-src 'self'` in lib/csp.ts stays
 * closed and no third party is contacted on a visitor's behalf.
 */

export const archivo = localFont({
  src: [{ path: './Archivo.var.woff2', weight: '100 900', style: 'normal' }],
  display: 'swap',
  variable: '--font-display',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
});

export const sourceSerif = localFont({
  src: [{ path: './SourceSerif4.var.woff2', weight: '200 900', style: 'normal' }],
  display: 'swap',
  variable: '--font-body',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
  adjustFontFallback: 'Times New Roman',
});

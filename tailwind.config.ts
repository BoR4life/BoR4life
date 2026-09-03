import type { Config } from 'tailwindcss';

/**
 * Tokens mirror docs/01-art-direction.md exactly. Do not add ad-hoc colors
 * or sizes in components — extend here first, so the design system stays
 * the single source of truth rather than drifting per-component.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // `rgb(var(--token) / <alpha-value>)` rather than `var(--token)`, so
      // Tailwind can compose `/80` into a real colour. With a bare var() it
      // cannot, and fails silently — see the note in app/globals.css.
      colors: {
        ink: {
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
        },
        paper: {
          100: 'rgb(var(--paper-100) / <alpha-value>)',
          0: 'rgb(var(--paper-000) / <alpha-value>)',
        },
        signal: 'rgb(var(--signal) / <alpha-value>)',
        critical: 'rgb(var(--critical) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      /*
        Optical weight compensation.

        `font-semibold` was doing every job on this site, from a 12px caps
        label to an 84px headline — a 7x size range at one weight. Stroke
        thickness scales with size but perceived weight does not, so 600 at
        84px reads distinctly heavier than 600 at 12px, and a page set that
        way looks unevenly weighted without it being obvious why.

        The site already compensates for exactly this on the letter-spacing
        axis (-0.04em at display, +0.14em on caps labels). It could not
        compensate on weight, because the font was declared as three static
        cuts and only 400/500/600 were reachable. With the axis open, these
        are the two ends of the correction:

          font-hero    560   44px and up. Slightly lighter, so a headline
                             carries the same visual weight as the 600 it
                             sits above rather than out-shouting it.
          font-label   520   12-14px uppercase labels. Slightly heavier,
                             because small caps on a dark ground lose
                             stroke to the background.

        Deliberately two steps, not a full optical scale. Every value here
        is a judgement about how the page looks and those belong to Brad —
        two defensible corrections are worth more than nine invented ones.
        Section headings keep `font-semibold` unchanged.
      */
      fontWeight: {
        hero: '560',
        label: '520',
      },
      maxWidth: {
        content: '1440px',
        prose: '68ch',
      },
      transitionTimingFunction: {
        reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

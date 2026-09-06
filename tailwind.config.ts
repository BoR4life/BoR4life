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
        /*
          Brand kit v1.0. Every value is `rgb(var(--token) / <alpha-value>)`
          so an alpha modifier composes — an opaque `var(--token)` here
          silently yields rgba(0,0,0,0) and Tailwind does not warn. The
          tokens themselves, and which of them are the amended text values,
          are in app/globals.css.

          The old scale (ink-900/700/500/300, paper-100/0, signal) is gone
          rather than aliased. Aliasing would have kept every existing class
          compiling while inverting what it meant — `bg-paper` was the dark
          page ground and the ground is now paper — and a build that compiles
          into a light-on-light page is worse than one that fails.
        */
        ink: 'rgb(var(--ink) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        rule: 'rgb(var(--rule) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          weak: 'rgb(var(--muted-weak) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          ink: 'rgb(var(--accent-ink) / <alpha-value>)',
        },
        critical: 'rgb(var(--critical) / <alpha-value>)',
        caution: 'rgb(var(--caution) / <alpha-value>)',
        stable: 'rgb(var(--stable) / <alpha-value>)',
      },
      fontFamily: {
        // Archivo for display and interface, Source Serif 4 for body. The
        // pairing is the kit's and the inversion is deliberate — see
        // app/fonts/index.ts.
        sans: ['var(--font-sans)'],
        body: ['var(--font-serif)'],
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

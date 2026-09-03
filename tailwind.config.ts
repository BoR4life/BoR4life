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

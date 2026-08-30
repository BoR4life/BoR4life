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
      colors: {
        ink: {
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
          500: 'var(--ink-500)',
          300: 'var(--ink-300)',
        },
        paper: {
          100: 'var(--paper-100)',
          0: 'var(--paper-000)',
        },
        signal: 'var(--signal)',
        critical: 'var(--critical)',
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

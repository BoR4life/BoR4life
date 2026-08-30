import { test, expect } from '@playwright/test';

/**
 * Design-token contrast gate.
 *
 * budgets.json requires 4.5:1 for normal text and 3:1 for large text. The
 * art direction says to compute these rather than eyeball them — this is
 * where that is enforced, so a token can never be introduced or reused on
 * a ground it fails against.
 *
 * This caught a real bug: ink-500 shipped as footer text on a dark ground
 * at 1.9:1, which failed every page at once.
 */

const TOKENS = {
  'ink-900': '#0a0c0f',
  'ink-700': '#16191f',
  'ink-500': '#3a414d',
  'ink-300': '#8b939f',
  'paper-100': '#f4f5f7',
  'paper-000': '#ffffff',
  signal: '#00e0b8',
  critical: '#ff5a4e',
} as const;

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const channel = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function ratio(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Every pairing the site actually uses for TEXT. Adding a row here is the
// deliberate act of promising it is legible.
const TEXT_PAIRS: Array<[keyof typeof TOKENS, keyof typeof TOKENS]> = [
  ['ink-300', 'ink-900'],
  ['ink-300', 'ink-700'],
  ['paper-100', 'ink-900'],
  ['paper-000', 'ink-900'],
  ['signal', 'ink-900'],
  ['critical', 'ink-700'],
  ['ink-900', 'paper-100'],
  ['ink-500', 'paper-100'],
  ['ink-900', 'signal'], // CTA: dark text on the signal fill
];

for (const [fg, bg] of TEXT_PAIRS) {
  test(`contrast: ${fg} on ${bg} meets 4.5:1`, () => {
    expect(ratio(TOKENS[fg], TOKENS[bg])).toBeGreaterThanOrEqual(4.5);
  });
}

// Guard the specific mistake that shipped, so it cannot come back.
test('ink-500 is never legible as text on dark grounds', () => {
  expect(ratio(TOKENS['ink-500'], TOKENS['ink-900'])).toBeLessThan(4.5);
  expect(ratio(TOKENS['ink-500'], TOKENS['ink-700'])).toBeLessThan(4.5);
});

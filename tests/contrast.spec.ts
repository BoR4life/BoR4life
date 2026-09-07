import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Every colour pairing on the site, proved by calculation.
 *
 * This file exists because a border token was once used as footer text at
 * 1.9:1 across five pages and looked fine to everyone who looked at it.
 *
 * It was then rewritten, because the version before this one had rotted
 * into exactly the failure it was built to prevent: it hard-coded the hex
 * values of a palette that had been replaced wholesale, so it went on
 * passing while proving facts about colours no longer present anywhere in
 * the site. A green test asserting nothing is worse than no test.
 *
 * So the tokens are now PARSED FROM app/globals.css rather than copied.
 * There is no second list to keep in step, and a token that changes value
 * is re-proved on the next run whether or not anyone remembers this file.
 *
 * Floors. The brand kit holds a 7:1 body-text floor, which is AAA and
 * stricter than the AA this site is otherwise gated at. Where a token is
 * used for words it is held to 7. Large text and interface elements are
 * held to 4.5, and non-text indicators to 3.
 */

const GLOBALS = path.join(process.cwd(), 'app', 'globals.css');

type Palette = Record<string, [number, number, number]>;

/** Pull `--token: r g b;` declarations out of a block of the stylesheet. */
function parseBlock(css: string, from: number, to: number): Palette {
  const out: Palette = {};
  for (const m of css.slice(from, to).matchAll(/--([a-z-]+):\s*(\d+)\s+(\d+)\s+(\d+)\s*;/g)) {
    out[m[1] as string] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

function palettes(): { light: Palette; dark: Palette } {
  const css = readFileSync(GLOBALS, 'utf8');
  const darkAt = css.indexOf('@media (prefers-color-scheme: dark)');
  expect(darkAt, 'no dark block found in globals.css').toBeGreaterThan(-1);
  const light = parseBlock(css, 0, darkAt);
  // The dark block only redefines what changes, so it inherits the rest.
  const dark = { ...light, ...parseBlock(css, darkAt, css.length) };
  return { light, dark };
}

function luminance([r, g, b]: [number, number, number]): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function ratio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, floor, what it is] */
const PAIRINGS: [string, string, number, string][] = [
  // Body text — the kit's 7:1 floor.
  ['ink', 'paper', 7, 'body text on the page ground'],
  ['ink', 'surface', 7, 'body text on a raised band'],
  ['muted', 'paper', 7, 'captions and source lines on the page'],
  ['muted', 'surface', 7, 'captions on a raised band'],
  ['critical', 'paper', 7, 'clinical state rendered as words'],
  ['caution', 'paper', 7, 'clinical state rendered as words'],
  ['stable', 'paper', 7, 'clinical state rendered as words'],
  // Large text and interface.
  ['accent', 'paper', 4.5, 'links and eyebrows'],
  ['accent', 'surface', 4.5, 'links on a raised band'],
  ['accent-ink', 'accent', 4.5, 'the label inside a filled call to action'],
  ['muted-weak', 'paper', 4.5, 'large and interface only'],
  // Non-text.
  ['rule', 'paper', 1.2, 'a hairline, which only has to be visible'],
];

for (const theme of ['light', 'dark'] as const) {
  test(`${theme}: every pairing meets its floor`, () => {
    const palette = palettes()[theme];
    const failures: string[] = [];

    for (const [fg, bg, floor, what] of PAIRINGS) {
      const f = palette[fg];
      const b = palette[bg];
      expect(f, `token --${fg} is not defined`).toBeDefined();
      expect(b, `token --${bg} is not defined`).toBeDefined();
      const r = ratio(f as [number, number, number], b as [number, number, number]);
      if (r < floor) {
        failures.push(`${fg} on ${bg} is ${r.toFixed(2)}:1, below ${floor}:1 — ${what}`);
      }
    }

    expect(failures, `\n${failures.join('\n')}\n`).toEqual([]);
  });
}

test('the accent is never legible as text on an ink ground', () => {
  // The kit records this explicitly: the accent is 2.07 on ink and cannot
  // appear on an ink ground at all. Asserted as a known limit rather than
  // left as folklore, so anyone tempted to put a link inside an ink field
  // is stopped by a failing build instead of a code review.
  const { light } = palettes();
  const r = ratio(
    light.accent as [number, number, number],
    light.ink as [number, number, number],
  );
  expect(r, 'accent has become legible on ink — re-check the kit before relying on it').toBeLessThan(4.5);
});

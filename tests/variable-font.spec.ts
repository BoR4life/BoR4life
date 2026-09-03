import { test, expect } from '@playwright/test';

/**
 * The face is a variable font and the site uses it as one.
 *
 * This is easy to get wrong invisibly, which is why it is asserted rather
 * than eyeballed. The font shipped here for weeks as three separate static
 * declarations — 400, 500 and 600 — which looked completely correct on the
 * page and quietly clamped the other 500 steps of an axis the file already
 * contained.
 *
 * A test that only read `getComputedStyle().fontWeight` would have passed
 * against that broken setup too: CSS reports the weight you asked for
 * whether or not the font can deliver it. So the load-bearing assertion
 * here measures rendered glyph advance. Nothing but a real axis makes the
 * same string at 560 come out a different width to the same string at 600.
 */

test('the whole weight axis is served by one file', async ({ page }) => {
  const woff2: string[] = [];
  page.on('response', (r) => {
    if (r.url().endsWith('.woff2')) woff2.push(r.url());
  });

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  // One file for every weight on the page. Three byte-identical copies were
  // deduped by the build, but the declaration is what makes the axis
  // reachable, and a second file appearing here means someone has added a
  // static cut back.
  expect(woff2, `expected a single font file, got:\n${woff2.join('\n')}`).toHaveLength(1);

  const declared = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.family.includes('interTight') && !f.family.includes('Fallback'))
      .map((f) => f.weight),
  );
  // A range, not a point. '100 900' is the descriptor that opens the axis.
  expect(declared).toEqual(['100 900']);
});

test('an intermediate weight renders, rather than snapping to a static cut', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  const widths = await page.evaluate(async () => {
    await document.fonts.ready;
    const el = document.createElement('span');
    el.style.cssText =
      'position:absolute;left:-9999px;white-space:nowrap;font-size:100px;font-family:var(--font-display)';
    el.textContent = 'Handgloves 280';
    document.body.appendChild(el);
    const at = (w: string) => {
      el.style.fontWeight = w;
      return el.getBoundingClientRect().width;
    };
    const out = { w400: at('400'), w520: at('520'), w560: at('560'), w600: at('600') };
    el.remove();
    return out;
  });

  // Strictly increasing. Under the old three-cut declaration 520 and 560
  // both snapped to a neighbouring cut and at least one of these
  // comparisons collapsed to equality.
  expect(widths.w400).toBeLessThan(widths.w520);
  expect(widths.w520).toBeLessThan(widths.w560);
  expect(widths.w560).toBeLessThan(widths.w600);
});

test('display headings carry the optical correction and small caps carry theirs', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  // The hero is the largest type on the site and the reason the correction
  // exists: 600 at this size out-shouts the 600 beneath it.
  const hero = page.locator('h1').first();
  await expect(hero).toHaveCSS('font-weight', '560');

  const label = page.locator('.uppercase').first();
  await expect(label).toHaveCSS('font-weight', '520');
});

test('no two headings of the same rendered size disagree about weight', async ({ page }) => {
  // The first cut of this correction keyed on the clamp FLOOR, which put two
  // headings that both render at 52px on different weights. Same size, same
  // weight, or the page looks arbitrary.
  for (const route of ['/', '/platform', '/evidence', '/solutions', '/about']) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);

    const bySize = await page.evaluate(() => {
      const map: Record<string, string[]> = {};
      for (const el of document.querySelectorAll('h1, h2, h3')) {
        if (!(el.textContent ?? '').trim()) continue;
        const s = getComputedStyle(el);
        const size = Math.round(parseFloat(s.fontSize));
        if (size < 40) continue; // the correction only applies to display sizes
        (map[size] ??= []).push(s.fontWeight);
      }
      return map;
    });

    for (const [size, weights] of Object.entries(bySize)) {
      const unique = [...new Set(weights)];
      expect(unique, `${route}: headings at ${size}px use ${unique.join(' and ')}`).toHaveLength(1);
    }
  }
});

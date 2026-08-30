import { test, expect } from '@playwright/test';

/**
 * The opening narrative must advance through its stages on scroll, and —
 * more importantly — must never be the only place information lives.
 */

test('narrative advances through its three stages', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(400);

  const captions = ['The frontier', 'The moment before', 'Ready'];
  const seen: string[] = [];

  for (const y of [0, 400, 900, 1400, 1900, 2400]) {
    await page.evaluate((py) => window.scrollTo(0, py), y);
    await page.waitForTimeout(350);
    for (const c of captions) {
      const op = await page
        .getByText(c, { exact: true })
        .evaluate((el) => getComputedStyle(el.parentElement!).opacity);
      if (Number(op) > 0.6 && !seen.includes(c)) seen.push(c);
    }
  }

  // All three stages must actually become visible while scrolling through.
  expect(seen.sort()).toEqual(captions.slice().sort());
});

test('every caption is in the DOM regardless of scroll position', async ({
  page,
}) => {
  await page.goto('/');
  for (const c of ['The frontier', 'The moment before', 'Ready']) {
    await expect(page.getByText(c, { exact: true })).toHaveCount(1);
  }
});

test('reduced motion shows the final state immediately', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(500);

  // No tall scroll wrapper, and the lit bay is the visible frame.
  const heroHeight = await page
    .locator('section[aria-labelledby="hero-heading"] > div')
    .evaluate((el) => el.getBoundingClientRect().height);
  const viewport = page.viewportSize()!.height;
  expect(heroHeight).toBeLessThan(viewport * 1.5);

  await ctx.close();
});

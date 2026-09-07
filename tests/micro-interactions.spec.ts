import { test, expect } from '@playwright/test';

/**
 * Micro-interactions, asserted rather than eyeballed.
 *
 * The failure mode these guard against is not "the animation is missing" —
 * it is "the animation only responds to a mouse". Keyboard users are not
 * left with nothing here, because :focus-visible already draws a signal
 * ring; wiring the underline to focus as well is belt and braces, and the
 * test exists so a later refactor cannot quietly make hover the only
 * trigger.
 */

test('the header condenses once the page scrolls', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header');
  const tall = (await header.boundingBox())!.height;

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForFunction(() => window.scrollY > 500);
  await page.waitForTimeout(500); // let the transition settle

  const short = (await header.boundingBox())!.height;
  expect(short, 'header should be shorter after scrolling').toBeLessThan(tall);

  // And it must come back, so the top of the page is never left condensed.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  expect((await header.boundingBox())!.height).toBeCloseTo(tall, 0);
});

test('the header does not condense under reduced motion', async ({ browser }) => {
  // Not "condenses faster" — never arms. A resizing header is precisely the
  // motion someone with a vestibular condition has asked not to see.
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  const header = page.locator('header');
  const before = (await header.boundingBox())!.height;

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);

  expect((await header.boundingBox())!.height).toBeCloseTo(before, 0);
  await ctx.close();
});

test('the nav underline responds to keyboard focus, not just hover', async ({
  page,
}) => {
  await page.goto('/');
  const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
    name: 'Evidence',
  });

  const scaleOf = async () =>
    link.evaluate(
      (el) =>
        getComputedStyle(el, '::after').transform,
    );

  const resting = await scaleOf();
  await link.focus();
  await page.waitForTimeout(400);
  const focused = await scaleOf();

  expect(resting, 'inactive link should start with a collapsed rule').not.toBe(
    focused,
  );
  // matrix(1, 0, 0, 1, 0, 0) is scaleX(1) — fully drawn.
  expect(focused).toContain('matrix(1');
});

test('the CTA arrow is decorative and the label is what is announced', async ({
  page,
}) => {
  await page.goto('/');
  // Scoped to main: the header carries a CTA with the same label, and it
  // deliberately has no arrow — that nav row is already at its width limit
  // at 768px, and a glyph there is what tips the CTA onto a second line.
  const cta = page
    .locator('main')
    .getByRole('link', { name: 'Request a demo' })
    .first();
  await expect(cta).toBeVisible();
  // The arrow must not reach the accessibility tree.
  await expect(cta.locator('[aria-hidden="true"]')).toHaveText('→');
  expect(await cta.getAttribute('href')).toBe('/contact');
});

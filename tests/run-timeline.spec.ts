import { test, expect } from '@playwright/test';

/**
 * The interactive scenario timeline.
 *
 * The site's one dynamic element, so the things worth pinning are the ones
 * that make it defensible rather than decorative: that it works from the
 * keyboard, that nothing is hidden behind the interaction, and that it does
 * not become an inert control when scripting is off.
 */

test('the whole run is present before anyone touches it', async ({ page }) => {
  // Nothing is hidden behind the interaction. A reader who never uses the
  // control, and a crawler, both get the complete picture.
  await page.goto('/evidence');
  const marks = page.locator('svg circle.fill-accent');
  await expect(marks).toHaveCount(22);
  await expect(page.getByText('22 of 22 moments recorded')).toBeVisible();
});

test('scrubbing back thins the marks out evenly, not in a block', async ({ page }) => {
  // This is the page's actual claim — capture happens throughout the run,
  // not reconstructed at the end — so it is the thing worth asserting.
  await page.goto('/evidence');
  const slider = page.getByRole('slider', { name: /move through the run/i });
  await expect(slider).toBeEnabled();

  await slider.fill('50');
  const half = await page.locator('svg circle.fill-accent').count();
  expect(half, 'half way through, roughly half the marks should be recorded').toBeGreaterThan(6);
  expect(half).toBeLessThan(18);

  await slider.fill('0');
  await expect(page.locator('svg circle.fill-accent')).toHaveCount(0);
});

test('the control is operable from the keyboard', async ({ page }) => {
  await page.goto('/evidence');
  const slider = page.getByRole('slider', { name: /move through the run/i });
  await slider.focus();
  await expect(slider).toBeFocused();

  const before = await page.locator('svg circle.fill-accent').count();
  for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowLeft');
  const after = await page.locator('svg circle.fill-accent').count();
  expect(after, 'arrow keys did not move the playhead').toBeLessThan(before);

  await page.keyboard.press('Home');
  await expect(page.locator('svg circle.fill-accent')).toHaveCount(0);
});

test('the count is announced, not left to colour alone', async ({ page }) => {
  await page.goto('/evidence');
  const live = page.locator('[aria-live="polite"]');
  await expect(live).toContainText('22 of 22');
  await page.getByRole('slider', { name: /move through the run/i }).fill('0');
  await expect(live).toContainText('0 of 22');
});

test('with JavaScript off the control is honestly disabled, not fake', async ({ browser }) => {
  // An enabled slider that does nothing is worse than no slider. The run
  // still renders complete, so nothing is lost.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/evidence');

  await expect(page.locator('svg circle.fill-accent')).toHaveCount(22);
  await expect(page.getByRole('slider', { name: /move through the run/i })).toBeDisabled();

  await context.close();
});

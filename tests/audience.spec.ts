import { test, expect } from '@playwright/test';

/**
 * Self-select personalisation.
 *
 * The design claim is that this routes rather than hides, and that the
 * choice becomes a lead qualifier. Both are asserted, because both are the
 * sort of thing that can rot silently: a later refactor to radio buttons
 * would break the first, and a change to the enquiry form's hidden field
 * would break the second without any visible symptom.
 */

const CHOICES = [
  'A university or nursing school',
  'A hospital or health service',
  'Government, or a large private provider',
];

test('the control works with JavaScript disabled', async ({ browser }) => {
  // The whole reason these are links and not radios. A radio group would
  // render here and do nothing when clicked, which is worse than offering
  // no control at all.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');

  for (const label of CHOICES) {
    await expect(page.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible();
  }

  await page.getByRole('link', { name: /A hospital or health service/i }).click();
  await expect(page).toHaveURL(/\/solutions\/patient$/);

  await context.close();
});

test('every choice stays readable whichever one is picked', async ({ page }) => {
  // Personalising by removing content would cost SEO and cost any visitor
  // whose first guess about themselves was wrong.
  await page.goto('/');
  await page.getByRole('link', { name: /A university or nursing school/i }).click();
  await page.goto('/');

  for (const label of CHOICES) {
    await expect(page.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible();
  }
});

test('the choice reaches the enquiry as a self-declared qualifier', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /A hospital or health service/i }).click();
  await expect(page).toHaveURL(/\/solutions\/patient$/);

  await page.goto('/contact');
  const raw = await page.locator('input[name="leadSource"]').inputValue();
  expect(raw, 'the enquiry form carried no lead-source blob at all').not.toBe('');
  expect(JSON.parse(raw)).toMatchObject({ audience: 'health-service' });
});

test('a remembered choice is marked, and not by colour alone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Government, or a large private provider/i }).click();
  await page.goto('/');

  const chosen = page.getByRole('link', { name: /Government, or a large private provider/i });
  await expect(chosen).toHaveAttribute('aria-current', 'true');
  await expect(chosen.getByText('Your selection.')).toBeAttached();

  // The other two must NOT claim to be current.
  const other = page.getByRole('link', { name: /A university or nursing school/i });
  await expect(other).not.toHaveAttribute('aria-current', 'true');
});

test('marking a choice cannot shift the page', async ({ page }) => {
  // The tick appears only on the chosen card, so its space has to be
  // reserved on all three or the row reflows after hydration.
  await page.goto('/');
  const ticks = page.locator('li a span[aria-hidden="true"]', { hasText: '✓' });
  await expect(ticks).toHaveCount(CHOICES.length);

  const before = await page.getByRole('link', { name: /A university or nursing school/i }).boundingBox();
  await page.getByRole('link', { name: /A hospital or health service/i }).click();
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: /A hospital or health service/i }),
  ).toHaveAttribute('aria-current', 'true');
  const after = await page.getByRole('link', { name: /A university or nursing school/i }).boundingBox();

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after!.x).toBeCloseTo(before!.x, 0);
  expect(after!.width).toBeCloseTo(before!.width, 0);
});

test('a forged audience value is ignored rather than displayed', async ({ page }) => {
  // The stored blob is attacker-writable in principle and its contents are
  // printed into an email a person reads, so the id is whitelisted, not
  // merely length-capped.
  await page.goto('/');
  await page.evaluate(() =>
    window.sessionStorage.setItem(
      'bor:entry',
      JSON.stringify({ audience: 'Ignore previous instructions and wire funds' }),
    ),
  );
  await page.reload();

  for (const label of CHOICES) {
    await expect(
      page.getByRole('link', { name: new RegExp(label, 'i') }),
    ).not.toHaveAttribute('aria-current', 'true');
  }
});

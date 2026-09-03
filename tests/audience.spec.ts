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
  'A government department or large provider',
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
  await page.getByRole('link', { name: /A government department or large provider/i }).click();
  await page.goto('/');

  const chosen = page.getByRole('link', { name: /A government department or large provider/i });
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

test('every choice meets the WCAG 2.2 minimum target size', async ({ page }) => {
  // 2.5.8 Target Size (Minimum), AA: 24 by 24 CSS pixels. These are large
  // cards so this passes with room to spare, which is exactly why it is
  // worth pinning — a later redesign into a compact chip row is where this
  // silently regresses, and axe does not check it.
  await page.goto('/');
  for (const label of CHOICES) {
    const box = await page.getByRole('link', { name: new RegExp(label, 'i') }).boundingBox();
    expect(box, `${label} has no box`).not.toBeNull();
    expect(box!.width, `${label} width`).toBeGreaterThanOrEqual(24);
    expect(box!.height, `${label} height`).toBeGreaterThanOrEqual(24);
  }
});

test('the selected-state border passes non-text contrast', async ({ page }) => {
  // 1.4.11 Non-text Contrast, AA: 3:1. The border is a state indicator, so
  // it has to be distinguishable, and it is computed here rather than
  // eyeballed — this repo has already shipped a colour that looked fine to
  // everyone who looked at it and failed by calculation.
  await page.goto('/');
  await page.getByRole('link', { name: /A hospital or health service/i }).click();
  await page.goto('/');

  const chosen = page.getByRole('link', { name: /A hospital or health service/i });
  await expect(chosen).toHaveAttribute('aria-current', 'true');

  const ratio = await chosen.evaluate((el) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = (rgb: number[]) => {
      const [r, g, b] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const cs = getComputedStyle(el);
    const a = lum(parse(cs.borderTopColor));
    const b = lum(parse(cs.backgroundColor));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });

  expect(ratio).toBeGreaterThanOrEqual(3);
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

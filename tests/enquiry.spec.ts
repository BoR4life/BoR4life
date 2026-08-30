import { test, expect } from '@playwright/test';

/**
 * Enquiry form behaviour and its anti-spam controls.
 *
 * The form is the only untrusted-input surface on the site, so this covers
 * the security controls as well as the happy path — a honeypot that is
 * never exercised is a honeypot that silently breaks.
 */

test('rejects an empty submission with per-field errors', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: /send enquiry/i }).click();

  // Server-side validation should return field errors, not a success state.
  await expect(page.locator('[id$="-error"]').first()).toBeVisible();
  await expect(page.getByText(/thank you/i)).toHaveCount(0);
});

test('accepts a valid enquiry', async ({ page }) => {
  await page.goto('/contact');

  await page.fill('#name', 'Test Person');
  await page.fill('#email', 'test@example.org');
  await page.selectOption('#role', 'procurement');
  await page.fill(
    '#message',
    'We are evaluating immersive training for our nursing cohort.',
  );

  // The form rejects submissions faster than MIN_FILL_MS as non-human, so
  // wait past that threshold before submitting.
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: /send enquiry/i }).click();

  await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10_000 });
});

test('honeypot is present but hidden from real users', async ({ page }) => {
  await page.goto('/contact');
  const honeypot = page.locator('#website');

  // Present in the DOM for bots to find...
  await expect(honeypot).toHaveCount(1);
  // ...but not reachable by keyboard, and not announced.
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('[aria-hidden="true"] #website')).toHaveCount(1);
});

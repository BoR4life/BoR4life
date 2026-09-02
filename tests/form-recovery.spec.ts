import { test, expect } from '@playwright/test';

/**
 * The enquiry form is the only conversion point on the site, so the cost of
 * a defect here is a lost customer rather than a cosmetic bug.
 *
 * React 19 resets an uncontrolled form once its action completes — on every
 * path, including a failed one. Before app/contact/actions.ts echoed the
 * submitted values back, a buyer who wrote four considered sentences and
 * mistyped their email got the form back completely empty.
 */

const MESSAGE =
  'We run graduate nurse induction across four sites and want to compare VR options before the next budget round.';

async function fillPartly(page: import('@playwright/test').Page) {
  await page.goto('/contact');
  await page.getByLabel('Your name').fill('Alex Reed');
  await page.getByLabel('Work email').fill('not-an-email');
  await page.getByLabel('Organisation (optional)').fill('South West HHS');
  await page
    .getByLabel('What best describes you?')
    .selectOption('clinical-educator');
  await page.getByLabel('What are you looking to do?').fill(MESSAGE);
  await page.getByRole('button', { name: /send enquiry/i }).click();
  await expect(page.locator('[id$="-error"]').first()).toBeVisible({
    timeout: 10_000,
  });
}

test('a validation error keeps every word the visitor typed', async ({
  page,
}) => {
  await fillPartly(page);

  await expect(page.getByLabel('Your name')).toHaveValue('Alex Reed');
  await expect(page.getByLabel('Work email')).toHaveValue('not-an-email');
  await expect(page.getByLabel('Organisation (optional)')).toHaveValue(
    'South West HHS',
  );
  await expect(page.getByLabel('What best describes you?')).toHaveValue(
    'clinical-educator',
  );
  await expect(page.getByLabel('What are you looking to do?')).toHaveValue(
    MESSAGE,
  );
});

test('focus moves to the first field in error', async ({ page }) => {
  await fillPartly(page);

  // Only the email is wrong, so that is where the visitor should land —
  // not at the submit button they just pressed.
  await expect(page.getByLabel('Work email')).toBeFocused();
});

test('the honeypot is never echoed back', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#website').fill('bot-was-here', { force: true });
  await page.getByLabel('Your name').fill('Alex Reed');
  await page.getByRole('button', { name: /send enquiry/i }).click();
  await expect(page.locator('[id$="-error"]').first()).toBeVisible({
    timeout: 10_000,
  });

  // Telling a bot its honeypot value was seen teaches it what to change.
  await expect(page.locator('#website')).toHaveValue('');
});

import { test, expect } from '@playwright/test';

/**
 * Every enquiry must say where the lead came from. This is the one piece of
 * business analytics that needs no vendor and no cookie, and it is only
 * useful if it actually survives the visitor's journey: entry referrer and
 * campaign captured on the first page, carried across navigation, and
 * attached to the submission. Any break in that chain produces enquiries
 * that all read "direct", which looks like a working system reporting
 * boring data rather than a broken one.
 */

test('an enquiry carries its entry referrer, campaign and path', async ({
  page,
  baseURL,
}) => {
  // Arrive from LinkedIn with campaign tags, on the solutions page — not the
  // contact page — so the capture has to survive two navigations.
  await page.goto(
    `${baseURL}/solutions?utm_source=linkedin&utm_medium=post&utm_campaign=sept-launch`,
    { referer: 'https://www.linkedin.com/feed/' },
  );
  await page.getByRole('link', { name: /nursing/i }).first().click();
  await page.waitForURL(/\/solutions\/nursing/);
  await page.goto('/contact');

  // The hidden field must be populated with what was captured on entry,
  // not with the contact page's own (empty) referrer and query string.
  const raw = await page.locator('input[name="leadSource"]').inputValue();
  expect(raw).toBeTruthy();
  const parsed = JSON.parse(raw);
  expect(parsed.referrer).toBe('www.linkedin.com');
  expect(parsed.landing).toBe('/solutions');
  expect(parsed.utm).toEqual({
    utm_source: 'linkedin',
    utm_medium: 'post',
    utm_campaign: 'sept-launch',
  });
  expect(parsed.path).toEqual(['/solutions', '/solutions/nursing', '/contact']);
});

test('the source field is bounded and never breaks a real submission', async ({
  page,
}) => {
  await page.goto('/contact');
  await page.waitForTimeout(2200); // clear the anti-bot timing gate

  // A hostile or corrupt value in the hidden field must not reject the
  // enquiry — it is parsed as untrusted text and dropped, not validated.
  await page.evaluate(() => {
    const el = document.querySelector('input[name="leadSource"]') as HTMLInputElement;
    el.value = '{"referrer":"' + 'x'.repeat(3000) + '","utm":{"__proto__":"bad"},"path":123}';
  });

  await page.fill('#name', 'Test Person');
  await page.fill('#email', 'test@example.com');
  await page.selectOption('#role', 'procurement');
  await page.fill('#message', 'A legitimate enquiry with a corrupt source field.');
  await page.getByRole('button', { name: /send enquiry/i }).click();

  await expect(page.getByText(/thank you|we'll be in touch|received/i)).toBeVisible({
    timeout: 10_000,
  });
});

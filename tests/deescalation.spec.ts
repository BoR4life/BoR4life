import { test, expect } from '@playwright/test';
import { PARTNERS } from '../lib/partners';

/**
 * The de-escalation themes are the part of the site that maps onto a budget
 * line a health service already has, so they need to be present, attributed
 * correctly, and — the part that matters most — limited to what Brad
 * confirmed is deployable.
 */

const THEMES = PARTNERS.find((p) => p.name === 'Bodyswaps')?.themes ?? [];

test('the confirmed themes are named on the homepage', async ({ page }) => {
  await page.goto('/');
  expect(THEMES.length).toBe(3);
  for (const theme of THEMES) {
    await expect(
      page.getByRole('term').filter({ hasText: theme.name }),
    ).toBeVisible();
  }
});

test('the themes are attributed to the platform we distribute', async ({
  page,
}) => {
  await page.goto('/');
  // Claiming authorship of a partner's content is the failure mode here.
  await expect(
    page.getByText(/delivered through Bodyswaps, which Bundle of Rays distributes/i),
  ).toBeVisible();
});

test('the same themes appear on /platform, from the same source', async ({
  page,
}) => {
  await page.goto('/platform');
  for (const theme of THEMES) {
    await expect(page.getByText(theme.name, { exact: true })).toBeVisible();
  }
});

test('a theme we cannot deliver is never named', async ({ page }) => {
  // Considered and excluded: Brad confirmed it is not deployable today. A
  // scenario named on the site and absent from the demo is the fastest way
  // to lose a procurement conversation.
  for (const route of ['/', '/platform']) {
    await page.goto(route);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/breaking bad news|distressed famil/i);
  }
});

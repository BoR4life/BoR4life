import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility gate. budgets.json requires zero violations at
 * WCAG 2.2 AA.
 *
 * Automated tooling catches roughly 40% of real accessibility problems, so
 * this is a floor, not proof. The manual checks in
 * .claude/skills/ship-check/SKILL.md (keyboard traversal, reduced motion,
 * WebGL disabled, JS disabled) still have to be run before shipping.
 */

const ROUTES = ['/', '/platform', '/evidence', '/about', '/contact'];

for (const route of ROUTES) {
  test(`${route} has no accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${route} is fully usable with reduced motion`, async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(route);
    // With reduced motion the WebGL canvas must never mount — the poster
    // is the intended composition either way.
    await expect(page.locator('main')).toBeVisible();
    expect(await page.locator('canvas').count()).toBe(0);
    await context.close();
  });
}

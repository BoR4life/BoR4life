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

    // Settle scroll-reveals before scanning. Axe evaluates computed colour,
    // so an element mid-fade at opacity 0 reports as ~1.04:1 against its
    // own background — a false failure that masks real ones. Scrolling
    // through first tests the state a user actually reads.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);

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

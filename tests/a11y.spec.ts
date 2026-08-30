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
  test(`${route} has no accessibility violations`, async ({ browser }) => {
    // Scan with reduced motion. Axe evaluates *computed* colour, so any
    // element captured mid-fade reports a false contrast failure — an
    // opacity-0 node reads as ~1.04:1 against its own background, and a
    // half-faded one as ~3.5:1. Those artifacts mask real violations.
    //
    // Under reduced motion the reveals and the opening narrative do not
    // animate at all: every element renders at its final opacity
    // immediately, which is exactly the state whose colours we need to
    // verify. The animated path settles to this same state by design, and
    // tests/contrast.spec.ts independently proves the token maths.
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(route);
    await page.waitForTimeout(600);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    await context.close();
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

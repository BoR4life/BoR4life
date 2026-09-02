import { test, expect } from '@playwright/test';

/**
 * The skip link is the first thing a keyboard user meets and the one
 * accessibility affordance /accessibility names by hand. It has to do more
 * than scroll: it has to move focus, so the next Tab lands inside the
 * content instead of back at the top of the navigation.
 *
 * Before components/site/Main.tsx added tabIndex={-1}, activating it left
 * document.activeElement on <body> — the page moved, the keyboard user did
 * not. axe cannot see this.
 */

const ROUTES = ['/', '/evidence', '/contact', '/privacy'];

for (const route of ROUTES) {
  test(`skip link moves focus into the content on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();

    await page.keyboard.press('Enter');

    const landedOnMain = await page.evaluate(
      () => document.activeElement?.id === 'main',
    );
    expect(landedOnMain).toBe(true);

    // And the next Tab must go forward into the content, not back to the nav.
    await page.keyboard.press('Tab');
    const inHeader = await page.evaluate(
      () => !!document.activeElement?.closest('header'),
    );
    expect(inHeader).toBe(false);
  });
}

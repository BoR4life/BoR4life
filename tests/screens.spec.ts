import { test } from '@playwright/test';

// Visual capture helper — not an assertion suite. Run with:
//   npx playwright test tests/screens.spec.ts
const PAGES = ['/', '/platform', '/evidence', '/about', '/contact'];

for (const route of PAGES) {
  test(`capture ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-');
    await page.screenshot({ path: `/tmp/shot-${name}.png` });
  });
}

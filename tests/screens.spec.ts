import { test } from '@playwright/test';

// Capture destination. Overridable so a run can drop the frames somewhere
// other than /tmp without editing this file.
const OUT = process.env.SHOT_DIR ?? '/tmp';

// Visual capture helper — not an assertion suite. Run with:
//   npx playwright test tests/screens.spec.ts
const PAGES = [
  '/',
  '/platform',
  '/solutions',
  '/evidence',
  '/resources',
  '/about',
  '/contact',
  '/privacy',
  '/accessibility',
  '/customers',
];

for (const route of PAGES) {
  test(`capture ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route, { waitUntil: 'networkidle' });
    // Scroll through so IntersectionObserver-driven reveals settle —
    // fullPage capture alone does not scroll, so every section below the
    // fold would otherwise be photographed mid-fade at opacity 0.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const name = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-');
    await page.screenshot({ path: `${OUT}/shot-${name}.png` });
    await page.screenshot({ path: `${OUT}/full-${name}.png`, fullPage: true });
  });
}

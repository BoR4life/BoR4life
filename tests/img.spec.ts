import { test, expect } from '@playwright/test';

/**
 * Images, on every route rather than only the homepage.
 *
 * A `<picture>` with AVIF and WebP sources fails in a way that no build
 * catches and no casual look at the page reveals: if the AVIF is missing the
 * browser falls silently back to WebP, and if both are missing the element
 * collapses to nothing with the layout around it intact. Renaming an asset
 * without updating the page that uses it produces a page that looks
 * deliberately text-only.
 *
 * Checking only the homepage left every other route uncovered, which is
 * exactly where the risk sits: those images change when copy changes and
 * nobody re-reads the page afterwards.
 */

const ROUTES = [
  '/',
  '/platform',
  '/solutions',
  '/solutions/nursing',
  '/solutions/patient',
  '/solutions/custom',
  '/evidence',
  '/resources',
  '/about',
  '/contact',
  '/privacy',
  '/accessibility',
  '/customers',
];

for (const route of ROUTES) {
  test(`every image on ${route} loads`, async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.request().resourceType() === 'image' && r.status() >= 400) {
        failed.push(`${r.status()} ${r.url()}`);
      }
    });

    await page.goto(route);
    // Scroll the whole page: most images are lazy, so without this the test
    // would only ever prove that the ones above the fold exist.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
    });
    await page.waitForTimeout(1500);

    const broken = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src),
    );

    // Every <picture> must resolve to AVIF, not fall back. A missing AVIF is
    // invisible — WebP renders identically and costs roughly 40% more bytes
    // on every request, silently, for as long as nobody notices.
    const notAvif = await page.evaluate(() =>
      Array.from(document.querySelectorAll('picture'))
        .map((p) => p.querySelector('img'))
        .filter(
          (img): img is HTMLImageElement =>
            !!img && !!img.currentSrc && !/\.avif($|\?)/i.test(img.currentSrc),
        )
        .map((img) => img.currentSrc),
    );

    expect({ failed, broken, notAvif }).toEqual({
      failed: [],
      broken: [],
      notAvif: [],
    });
  });
}

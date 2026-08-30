import { test, expect } from '@playwright/test';

test('every image on the homepage actually loads', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    if (r.request().resourceType() === 'image' && r.status() >= 400) {
      failed.push(`${r.status()} ${r.url()}`);
    }
  });

  await page.goto('/');
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

  expect({ failed, broken }).toEqual({ failed: [], broken: [] });
});

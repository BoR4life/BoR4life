import { test, expect } from '@playwright/test';

/**
 * Guards the bug that broke the first deployments.
 *
 * `process.env.NEXT_PUBLIC_SITE_URL ?? fallback` looks correct but only
 * falls back on null/undefined. An environment variable defined with an
 * EMPTY value passes straight through, and `new URL('')` throws
 * ERR_INVALID_URL — which surfaced as a bare "Failed to collect page data
 * for /_not-found" long after the code had compiled cleanly.
 */

test('canonical URLs are absolute and well-formed', async ({ request }) => {
  const res = await request.get('/');
  const html = await res.text();

  const og = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
  expect(og, 'og:image must be present').toBeTruthy();

  // Must be absolute — a relative or empty base is what the bug produced,
  // and it silently breaks every social preview.
  expect(() => new URL(og!)).not.toThrow();
  expect(og!.startsWith('http')).toBe(true);
});

test('sitemap and robots emit absolute URLs', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const robots = await (await request.get('/robots.txt')).text();

  const loc = sitemap.match(/<loc>([^<]+)<\/loc>/)?.[1];
  expect(loc, 'sitemap must contain at least one URL').toBeTruthy();
  expect(() => new URL(loc!)).not.toThrow();

  expect(robots).toMatch(/Sitemap:\s*https?:\/\//);
});

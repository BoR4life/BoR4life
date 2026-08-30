import { test, expect } from '@playwright/test';
import sharp from 'sharp';

/**
 * Fraction of the frame that is not transparent, and the luminance range
 * across those pixels. Both matter: coverage alone would pass on a solid
 * fill, and range alone would pass on a handful of stray bright pixels.
 */
async function analyse(png: Buffer) {
  const { data, info } = await sharp(png)
    .resize(120, 68, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let covered = 0;
  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3]! <= 16) continue;
    covered++;
    const lum = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  const total = (info.width * info.height) || 1;
  return { covered: covered / total, range: covered ? max - min : 0 };
}

/**
 * The live WebGL scene.
 *
 * This test exists because every realistic failure mode of this feature is
 * SILENT. A blocked Draco decoder, a CSP directive that forbids WebAssembly,
 * a KTX2 transcoder served from the wrong path, a model that 404s — none of
 * them throw anything a visitor or a build would see. They all produce the
 * same result: the poster still, with a transparent canvas on top of it,
 * looking exactly like a working page. Asserting "a canvas element exists"
 * would pass in every one of those cases, so this reads pixels instead.
 */

test('the hero model loads and draws actual geometry', async ({ page }) => {
  // Fetch, Draco decode, KTX2 transcode and first shaded frame. Generous
  // because a cold CI runner with a software rasteriser is far slower than
  // any real device, and a flaky timeout here would train us to ignore it.
  test.setTimeout(120_000);
  const failures: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') failures.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    failures.push(`request failed: ${req.url()} (${req.failure()?.errorText})`);
  });

  await page.goto('/');

  // The section is deliberately below the fold and gated on proximity, so
  // it must be scrolled to before anything mounts at all.
  const section = page.locator('section', { hasText: 'This is a real environment' });
  await section.scrollIntoViewIfNeeded();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 30_000 });

  // The affordance chip renders only once HeroScene has called onReady,
  // which happens only after the model is parsed and added to the scene.
  // Without this assertion the pixel check below is vacuous: the canvas is
  // transparent and sits directly over the poster, so a screenshot of its
  // bounding box shows the poster and passes every coverage and contrast
  // threshold whether or not a single triangle was ever drawn.
  await expect(
    page.getByText('Drag to look around'),
    'scene never signalled ready — the model did not load',
  ).toBeVisible({ timeout: 60_000 });

  // Read pixels through Playwright's compositor, NOT by drawing the canvas
  // into a 2D context in the page. The renderer runs with the default
  // preserveDrawingBuffer:false — correct for performance — which means the
  // drawing buffer is already cleared by the time any in-page read happens,
  // so drawImage() returns a fully transparent surface whether the scene
  // rendered or not. That probe reports failure for a working scene, which
  // is worse than no test.
  let stats = { covered: 0, range: 0 };
  for (let attempt = 0; attempt < 40; attempt++) {
    const shot = await canvas.screenshot({ omitBackground: true });
    stats = await analyse(shot);
    if (stats.covered > 0.2 && stats.range > 12) break;
    await page.waitForTimeout(500);
  }

  // A fifth of the canvas covered, with real tonal range across it, is only
  // possible if geometry was decoded and shaded.
  expect(stats.covered, 'canvas is empty — model or decoder failed').toBeGreaterThan(0.2);
  expect(stats.range, 'canvas is flat — geometry drew but was not lit').toBeGreaterThan(12);

  // The decoders and the model must come from our own origin. A regression
  // to the gstatic default would still render, so nothing else here catches
  // it — but it would leak every visitor's IP to a third party.
  expect(failures.filter((f) => /Content Security Policy|decoder|\.wasm|\.glb/i.test(f))).toEqual(
    [],
  );
});

test('the model and decoders are served from this origin only', async ({
  page,
  baseURL,
}) => {
  // Compare against the configured base URL, not page.url(): at the moment
  // the very first request fires the page is still about:blank, so deriving
  // the origin from it flags the site's own document as external.
  const origin = new URL(baseURL!).origin;
  const external: string[] = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    // blob: and data: are minted by the page itself and address no host.
    if (url.protocol === 'blob:' || url.protocol === 'data:') return;
    if (url.origin !== origin) external.push(req.url());
  });

  await page.goto('/');
  await page
    .locator('section', { hasText: 'This is a real environment' })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(6000);

  // gstatic.com (Draco's default), raw.githack.com (drei's HDRI default),
  // or any other host appearing here is a privacy regression on a
  // healthcare site, not a performance detail.
  expect(external).toEqual([]);
});

test('reduced motion never mounts the canvas', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await page
    .locator('section', { hasText: 'This is a real environment' })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);

  // Not merely hidden — never created. The WebGL context, the model
  // download and the decoders must all be skipped entirely.
  expect(await page.locator('canvas').count()).toBe(0);
  await context.close();
});

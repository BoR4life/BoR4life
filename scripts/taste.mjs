#!/usr/bin/env node
/**
 * Reference reader.
 *
 *   npm run taste -- https://example.com
 *   npm run taste -- http://127.0.0.1:3000/platform   (read our own site)
 *
 * WHY THIS EXISTS
 *
 * The one design mistake made on this site was not a coding mistake. Given
 * three screenshots of a reference we admired, the look was read as "dark,
 * dramatic, saturated" and built that way. The references were light, soft,
 * matte and warm-neutral — very nearly the opposite. A day went into
 * rendering the wrong thing, and it was only caught by putting the
 * screenshots side by side at the end.
 *
 * Eyes are bad at this. They report a feeling ("clean", "premium") and the
 * feeling survives contact with the actual pixels. Instruments are good at
 * it: a ground colour is a number, and a number cannot be misremembered as
 * its opposite. So this script measures rather than describes — it reports
 * what a page IS, in px and hex, weighted by how much of the page each
 * value actually covers.
 *
 * It deliberately stops at measurement. It does not recommend, score, or
 * generate a palette. Turning measurements into a design decision is the
 * part that needs judgement and needs Brad, and a tool that skipped
 * straight to a recommendation would be the same mistake with more
 * confidence.
 *
 * Nothing here ships to the browser. It is a local instrument, run by hand
 * against a URL, and it writes to a directory that is not tracked.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Same three-environment problem as playwright.config.ts: use the sandbox's
// pinned binary when it is there, let Playwright find its own when it is
// not, and let an env var override both. A hard-coded path once failed
// every browser test in CI.
function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  if (existsSync(SANDBOX_CHROMIUM)) return SANDBOX_CHROMIUM;
  return undefined;
}

const url = process.argv[2];
if (!url) {
  console.error('usage: npm run taste -- <url>');
  process.exit(2);
}

// 1440x900 is the frame the rest of this repo captures at (tests/screens.spec.ts),
// so measurements are comparable against our own pages without rescaling.
const VIEWPORT = { width: 1440, height: 900 };
const OUT = process.env.TASTE_DIR ?? '.taste';

/**
 * Runs in the page. Walks every rendered element and tallies computed
 * values by the AREA they cover, not by how many nodes carry them.
 *
 * Area-weighting is the whole point. Counting nodes says a page is mostly
 * whatever its smallest, most numerous elements are — a hundred 12px list
 * items outvote the full-bleed ground behind them, and the tally reports a
 * page as light when it reads as dark. Area asks the question a viewer's
 * eye actually answers: how much of this screen is this colour?
 */
function extract() {
  const px = (v) => Math.round(parseFloat(v) || 0);
  const add = (map, key, weight) => {
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + weight);
  };
  const rank = (map, n = 12) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, weight]) => ({ value, weight: Math.round(weight) }));

  /**
   * Nearest ancestor painting a non-transparent background. Falls back to
   * the body colour at the root. Does not attempt to composite a
   * translucent stack — it reports the first real ground it finds, and
   * anything sitting on a 10%-alpha overlay is measured against what is
   * underneath, which is the conservative reading.
   */
  const groundBehind = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        const a = bg.match(/rgba?\([^)]*?([\d.]+)\s*\)$/);
        if (!a || parseFloat(a[1]) > 0.5) return bg;
      }
    }
    return getComputedStyle(document.body).backgroundColor;
  };

  const grounds = new Map();
  const inks = new Map();
  const families = new Map();
  const sizes = new Map();
  const weights = new Map();
  const leading = new Map();
  const tracking = new Map();
  const radii = new Map();
  const shadows = new Map();
  const borders = new Map();
  const gaps = new Map();

  // Vertical rhythm is measured from where section boundaries actually
  // land, not from declared padding — margin collapse and flex gaps mean
  // the declared value is often not the gap you see.
  const edges = [];

  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) === 0) continue;

    const area = r.width * r.height;

    const bg = s.backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') add(grounds, bg, area);

    // Text colour is weighted by the ink actually laid down — glyph count
    // times size — rather than by the box. A colour used once in a
    // 5.75rem headline matters more than the same colour in a caption, and
    // weighting by box area would rank a large empty container above both.
    const text = (el.textContent ?? '').trim();
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && text) {
      const size = px(s.fontSize);
      const load = Math.min(text.length, 400) * size;
      // Ink is tallied against the ground actually behind it, not the
      // document ground. This site alternates dark and light sections, so
      // measuring everything against the body colour reports the dark text
      // on the light bands as 1.00:1 — a catastrophic-looking figure for
      // type that is in fact 19.6:1. Walking up to the nearest painted
      // ancestor is the only way the number means anything.
      add(inks, `${s.color} on ${groundBehind(el)}`, load);
      add(families, s.fontFamily.split(',')[0].replace(/["']/g, '').trim(), load);
      add(sizes, `${size}px`, load);
      add(weights, s.fontWeight, load);
      if (size >= 12) {
        add(leading, `${(parseFloat(s.lineHeight) / size).toFixed(2)}`, load);
        add(tracking, `${(parseFloat(s.letterSpacing) / size || 0).toFixed(3)}em`, load);
      }
    }

    if (px(s.borderTopLeftRadius)) add(radii, `${px(s.borderTopLeftRadius)}px`, area);
    if (s.boxShadow && s.boxShadow !== 'none') add(shadows, s.boxShadow, area);
    if (px(s.borderTopWidth) && s.borderTopStyle !== 'none') {
      add(borders, `${px(s.borderTopWidth)}px ${s.borderTopColor}`, area);
    }
    if (s.display === 'flex' || s.display === 'grid') {
      const g = px(s.gap || s.rowGap);
      if (g) add(gaps, `${g}px`, area);
    }

    // Full-bleed blocks are what a page's structure is made of.
    if (r.width > VIEWPORT_WIDTH * 0.9 && r.height > 80) {
      edges.push({ top: Math.round(r.top + window.scrollY), height: Math.round(r.height) });
    }
  }

  const body = getComputedStyle(document.body);
  const bands = edges
    .sort((a, b) => a.top - b.top)
    .filter((e, i, arr) => i === 0 || e.top - arr[i - 1].top > 24)
    .slice(0, 24);

  return {
    ground: body.backgroundColor,
    documentHeight: document.documentElement.scrollHeight,
    grounds: rank(grounds),
    inks: rank(inks),
    families: rank(families, 6),
    sizes: rank(sizes),
    weights: rank(weights, 6),
    leading: rank(leading, 6),
    tracking: rank(tracking, 6),
    radii: rank(radii, 6),
    shadows: rank(shadows, 4),
    borders: rank(borders, 6),
    gaps: rank(gaps, 8),
    bands: bands.map((b) => b.height),
  };
}

/** sRGB relative luminance, WCAG 2.x definition. */
function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseRgb(value) {
  const m = value.match(/-?[\d.]+/g);
  if (!m || m.length < 3) return null;
  return m.slice(0, 3).map((n) => Math.round(parseFloat(n)));
}

const hex = (rgb) => '#' + rgb.map((c) => c.toString(16).padStart(2, '0')).join('');

/**
 * Light or dark is the single fact most often got wrong from memory, so it
 * is stated first and stated as a number. Luminance of the page ground,
 * nothing more interpretive than that.
 */
function keyOf(rgb) {
  const l = luminance(rgb);
  if (l > 0.6) return 'LIGHT';
  if (l > 0.18) return 'MID';
  return 'DARK';
}

/**
 * Colour cast, as the absolute spread between the strongest and weakest
 * channel (0-255).
 *
 * NOT max-min over max. That ratio is unusable at the dark end, which is
 * most of this site: #0a0c0f is (15-10)/15 = 0.33, the same figure as a
 * genuinely tinted mid-tone, and it printed our near-neutral black as
 * though it were a third of the way to saturated. Absolute spread says 5,
 * next to the teal's 224, which is the true relationship — and the whole
 * reason to measure instead of describe is that a wrong number is worse
 * than no number.
 *
 * Rule of thumb: under ~8 reads neutral, 8-40 is a deliberate cast, above
 * that it is a colour.
 */
function cast(rgb) {
  return Math.max(...rgb) - Math.min(...rgb);
}

/**
 * Outbound HTTPS in this environment goes through a local agent proxy, and
 * Chromium does not read the *_PROXY environment variables the way curl and
 * node do — it needs --proxy-server, or every navigation dies at
 * ERR_TUNNEL_CONNECTION_FAILED. localhost is excluded so reading our own
 * dev server does not round-trip through it.
 */
const proxy = process.env.HTTPS_PROXY ?? process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: resolveChromium(),
  ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}),
});
try {
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  await page.addInitScript(`window.VIEWPORT_WIDTH = ${VIEWPORT.width};`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

  // Scroll the full height and back. Anything revealed on scroll — which on
  // a site built like ours is most of the page — is display:none or
  // opacity:0 until it is, and would be skipped by the walk entirely.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });

  const data = await page.evaluate(extract);

  mkdirSync(OUT, { recursive: true });
  const slug = new URL(url).hostname.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-') +
    (new URL(url).pathname.replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-') || '');
  await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
  writeFileSync(`${OUT}/${slug}.json`, JSON.stringify({ url, ...data }, null, 2) + '\n');

  const groundRgb = parseRgb(data.ground);
  const line = (label, rows, fmt = (r) => r.value) =>
    console.log(label.padEnd(14) + rows.map(fmt).join('   '));

  console.log(`\n${url}`);
  console.log('─'.repeat(64));

  if (groundRgb) {
    console.log(
      `GROUND        ${hex(groundRgb)}  ${keyOf(groundRgb)}  ` +
        `luminance ${luminance(groundRgb).toFixed(3)}  cast ${cast(groundRgb)}`,
    );
  }

  // Grounds and inks are printed as hex with a share, because a percentage
  // is the thing an eye cannot estimate. "Mostly white with a warm tint"
  // and "mostly warm grey" feel identical and measure differently.
  const total = data.grounds.reduce((a, b) => a + b.weight, 0) || 1;
  console.log('\nGROUNDS   (share of painted area)');
  for (const g of data.grounds.slice(0, 8)) {
    const rgb = parseRgb(g.value);
    if (!rgb) continue;
    const pct = ((g.weight / total) * 100).toFixed(1).padStart(5);
    console.log(
      `  ${pct}%  ${hex(rgb).padEnd(9)} ${keyOf(rgb).padEnd(6)} cast ${String(cast(rgb)).padStart(3)}  ${g.value}`,
    );
  }

  const inkTotal = data.inks.reduce((a, b) => a + b.weight, 0) || 1;
  console.log('\nINK       (share of glyphs, against the ground behind them)');
  for (const i of data.inks.slice(0, 10)) {
    const [fg, bg] = i.value.split(' on ');
    const rgb = parseRgb(fg);
    const onRgb = parseRgb(bg);
    if (!rgb || !onRgb) continue;
    const pct = ((i.weight / inkTotal) * 100).toFixed(1).padStart(5);
    const a = luminance(rgb);
    const b = luminance(onRgb);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    // AA for body text is 4.5:1, 3:1 for large. Flagged rather than
    // asserted — this is an instrument, and tests/contrast.spec.ts is the
    // gate. A flag here on a legitimate large-type or non-text pairing is
    // a prompt to go and look, not a failure.
    const flag = ratio < 3 ? '  <- under 3:1' : ratio < 4.5 ? '  <- under 4.5:1' : '';
    console.log(
      `  ${pct}%  ${hex(rgb).padEnd(9)} on ${hex(onRgb).padEnd(9)} ${ratio.toFixed(2).padStart(6)}:1${flag}`,
    );
  }

  console.log('');
  line('FAMILIES', data.families);
  line('SIZES', data.sizes);
  line('WEIGHTS', data.weights);
  line('LEADING', data.leading);
  line('TRACKING', data.tracking);
  line('RADII', data.radii);
  line('BORDERS', data.borders.slice(0, 4));
  line('GAPS', data.gaps);
  console.log('SHADOWS'.padEnd(14) + (data.shadows.length ? '' : 'none'));
  for (const s of data.shadows) console.log('              ' + s.value);
  console.log(`BANDS         ${data.bands.join('  ')}`);
  console.log(`\nwrote ${OUT}/${slug}.json and ${OUT}/${slug}.png\n`);
} finally {
  await browser.close();
}

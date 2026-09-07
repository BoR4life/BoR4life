#!/usr/bin/env node
/**
 * Encode a Blender render to the AVIF + WebP pair the site ships.
 *
 *   node scripts/encode-still.mjs renders/web-doorway.png public/images/bay-doorway
 *
 * Written down rather than done ad hoc, because "how were the other images
 * encoded" is a question this repository could not previously answer — and
 * an image encoded at different settings from its neighbours is visible on
 * a page that shows several of them together.
 *
 * Quality is chosen to land inside budgets.json rather than at a fixed
 * number: a flat clinical interior and a dark landscape compress very
 * differently, so a single quality setting either wastes bytes on one or
 * blows the budget on the other. This steps quality down until the file
 * fits, and fails loudly if it cannot — never silently shipping something
 * over budget.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import sharp from 'sharp';

const BUDGETS = JSON.parse(readFileSync(new URL('../budgets.json', import.meta.url), 'utf8'));
const { maxWidth, avifKb, webpKb } = BUDGETS.prerenderedStills;

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) {
  console.error('usage: encode-still.mjs <input.png> <output-stem>');
  process.exit(1);
}

/**
 * Encode at descending quality until the result fits the budget.
 * Returns the buffer and the quality that produced it.
 */
async function fit(pipeline, encode, limitKb, label) {
  // 82 down to 40 is the useful range: above 82 the file grows fast with no
  // visible gain, below 40 the flat wall gradients in these renders start
  // to band, which is the one artifact that reads as "cheap" here.
  for (const quality of [82, 76, 70, 64, 58, 52, 46, 40]) {
    const buf = await encode(pipeline.clone(), quality).toBuffer();
    const kb = buf.byteLength / 1024;
    if (kb <= limitKb) return { buf, quality, kb };
  }
  throw new Error(
    `${label}: cannot fit ${limitKb}KB budget even at quality 40 — ` +
      `the source is probably too noisy or too large; re-render or crop it`,
  );
}

const pipeline = sharp(IN).resize({
  width: maxWidth,
  withoutEnlargement: true,
});

const avif = await fit(
  pipeline,
  (p, quality) => p.avif({ quality, effort: 6 }),
  avifKb,
  'avif',
);
const webp = await fit(
  pipeline,
  (p, quality) => p.webp({ quality, effort: 6 }),
  webpKb,
  'webp',
);

writeFileSync(`${OUT}.avif`, avif.buf);
writeFileSync(`${OUT}.webp`, webp.buf);

const name = basename(OUT);
console.log(`[still] ${name}.avif  q${avif.quality}  ${avif.kb.toFixed(0)}KB / ${avifKb}KB`);
console.log(`[still] ${name}.webp  q${webp.quality}  ${webp.kb.toFixed(0)}KB / ${webpKb}KB`);

#!/usr/bin/env node
/**
 * Asset budget gate.
 *
 * Reads budgets.json and enforces it against everything in public/.
 * Exits non-zero on any breach so CI and the pre-commit hook can block.
 *
 * This script is the reason the site stays fast as it grows. Every
 * "just this once, it's only 400KB" is caught here.
 *
 *   node scripts/validate-assets.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative, basename } from 'node:path';

const ROOT = process.cwd();
const BUDGETS = JSON.parse(readFileSync(join(ROOT, 'budgets.json'), 'utf8'));
const PUBLIC = join(ROOT, 'public');
const LICENCES = join(ROOT, 'docs', 'asset-licences.md');

const KB = 1024;
const failures = [];
const warnings = [];
const notes = [];

const fail = (file, msg) => failures.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

/** Recursively list files under dir. */
function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const sizeKb = (p) => statSync(p).size / KB;
const rel = (p) => relative(ROOT, p);

/* ------------------------------------------------------------------ */
/* GLB parsing                                                         */
/* ------------------------------------------------------------------ */

/**
 * Extract the JSON chunk from a .glb container.
 * Returns null for .gltf (already JSON) or on any malformed input —
 * callers treat null as "could not inspect" rather than "passed".
 */
function readGlbJson(path) {
  try {
    const buf = readFileSync(path);
    if (buf.length < 20) return null;
    if (buf.readUInt32LE(0) !== 0x46546c67) return null; // 'glTF'
    const chunkLength = buf.readUInt32LE(12);
    const chunkType = buf.readUInt32LE(16);
    if (chunkType !== 0x4e4f534a) return null; // 'JSON'
    return JSON.parse(buf.subarray(20, 20 + chunkLength).toString('utf8'));
  } catch {
    return null;
  }
}

function readModelJson(path) {
  if (extname(path).toLowerCase() === '.glb') return readGlbJson(path);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

/** Triangle count, summed across all mesh primitives. */
function countTriangles(gltf) {
  const accessors = gltf.accessors ?? [];
  let tris = 0;
  for (const mesh of gltf.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      // mode 4 (TRIANGLES) is the default when omitted
      if (prim.mode !== undefined && prim.mode !== 4) continue;
      if (prim.indices !== undefined && accessors[prim.indices]) {
        tris += accessors[prim.indices].count / 3;
      } else if (prim.attributes?.POSITION !== undefined) {
        const a = accessors[prim.attributes.POSITION];
        if (a) tris += a.count / 3;
      }
    }
  }
  return Math.round(tris);
}

/** Draw calls ≈ one per primitive per node referencing the mesh. */
function countDrawCalls(gltf) {
  const primsPerMesh = (gltf.meshes ?? []).map((m) => (m.primitives ?? []).length);
  const nodes = gltf.nodes ?? [];
  const used = nodes.filter((n) => n.mesh !== undefined);
  if (used.length === 0) return primsPerMesh.reduce((a, b) => a + b, 0);
  return used.reduce((sum, n) => sum + (primsPerMesh[n.mesh] ?? 0), 0);
}

/* ------------------------------------------------------------------ */
/* Checks                                                              */
/* ------------------------------------------------------------------ */

function checkModels(files) {
  const m = BUDGETS.models;
  const models = files.filter((f) => ['.glb', '.gltf'].includes(extname(f).toLowerCase()));

  // Source formats must never reach public/
  for (const f of files) {
    if (m.forbiddenFormats.includes(extname(f).toLowerCase())) {
      fail(rel(f), `source format ${extname(f)} must not ship — export to .glb`);
    }
  }

  if (models.length === 0) {
    notes.push('No .glb/.gltf models found under public/ — model checks skipped.');
    return;
  }

  for (const f of models) {
    const isHero = /hero/i.test(f);
    const label = isHero ? 'hero' : 'secondary';
    const sizeLimit = isHero ? m.heroGltfKb : m.secondaryGltfKb;
    const triLimit = isHero ? m.heroTriangles : m.secondaryTriangles;

    const kb = sizeKb(f);
    if (kb > sizeLimit) {
      fail(rel(f), `${kb.toFixed(0)}KB exceeds ${label} budget of ${sizeLimit}KB — run scripts/optimize-gltf.sh`);
    }

    const gltf = readModelJson(f);
    if (!gltf) {
      warn(rel(f), 'could not parse glTF JSON — not inspected for geometry or extensions');
      continue;
    }

    const used = gltf.extensionsUsed ?? [];
    for (const ext of m.requiredExtensions) {
      if (!used.includes(ext)) {
        fail(rel(f), `missing required extension ${ext} — asset is not compressed`);
      }
    }

    const tris = countTriangles(gltf);
    if (tris > triLimit) {
      fail(rel(f), `${tris.toLocaleString()} triangles exceeds ${label} budget of ${triLimit.toLocaleString()} — decimate in look-dev`);
    }

    const draws = countDrawCalls(gltf);
    if (draws > m.maxDrawCalls) {
      fail(rel(f), `~${draws} draw calls exceeds budget of ${m.maxDrawCalls} — merge meshes and atlas materials`);
    }

    // Uncompressed textures embedded in or referenced by the model
    for (const img of gltf.images ?? []) {
      if (img.uri && m.forbiddenTextureFormats.some((e) => img.uri.toLowerCase().endsWith(e))) {
        fail(rel(f), `references uncompressed texture "${img.uri}" — convert to KTX2`);
      }
      if (img.mimeType && /image\/(png|jpeg)/.test(img.mimeType)) {
        fail(rel(f), 'embeds a PNG/JPEG texture — convert to KTX2 (ETC1S albedo, UASTC normal/ORM)');
      }
    }

  }

  const heroes = models.filter((f) => /hero/i.test(f));
  if (heroes.length > 1) {
    fail('public/models', `${heroes.length} hero models found — the spec allows exactly one live WebGL scene`);
  }
}

function checkStills(files) {
  const s = BUDGETS.prerenderedStills;
  const imgs = files.filter((f) => ['.avif', '.webp', '.png', '.jpg', '.jpeg'].includes(extname(f).toLowerCase()));

  if (imgs.length === 0) {
    notes.push('No raster images found under public/ — still checks skipped.');
    return;
  }

  for (const f of imgs) {
    const ext = extname(f).toLowerCase().slice(1);
    const kb = sizeKb(f);

    if (ext === 'avif' && kb > s.avifKb) {
      fail(rel(f), `${kb.toFixed(0)}KB exceeds AVIF budget of ${s.avifKb}KB`);
    }
    if (ext === 'webp' && kb > s.webpKb) {
      fail(rel(f), `${kb.toFixed(0)}KB exceeds WebP budget of ${s.webpKb}KB`);
    }
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      warn(rel(f), `legacy format .${ext} — ship AVIF with a WebP fallback`);
    }
  }

  // Every AVIF should have a WebP sibling for fallback
  const stems = new Set(imgs.map((f) => f.replace(/\.[^.]+$/, '')));
  for (const stem of stems) {
    const hasAvif = existsSync(`${stem}.avif`);
    const hasWebp = existsSync(`${stem}.webp`);
    if (hasAvif && !hasWebp) {
      warn(rel(`${stem}.avif`), 'no .webp fallback sibling');
    }
  }
}

function checkVideo(files) {
  const v = BUDGETS.prerenderedVideo;
  const vids = files.filter((f) => ['.mp4', '.webm', '.mov'].includes(extname(f).toLowerCase()));

  if (vids.length === 0) {
    notes.push('No video found under public/ — loop checks skipped.');
    return;
  }

  for (const f of vids) {
    if (extname(f).toLowerCase() === '.mov') {
      fail(rel(f), '.mov must not ship — encode to AV1 (mp4) with an H.264 fallback');
      continue;
    }
    const kb = sizeKb(f);
    const isAv1 = /av1/i.test(basename(f));
    const limit = isAv1 ? v.av1Kb : v.h264Kb;
    if (kb > limit) {
      fail(rel(f), `${kb.toFixed(0)}KB exceeds ${isAv1 ? 'AV1' : 'H.264'} budget of ${limit}KB — shorten the loop or lower the bitrate`);
    }

    if (v.requiresPosterFrame) {
      const stem = f.replace(/\.[^.]+$/, '');
      // A single poster legitimately serves every codec variant of the same
      // clip, so strip a trailing codec suffix before looking for it.
      // Requiring one poster per encode would just duplicate bytes.
      const base = stem.replace(/-(av1|h264|vp9|hevc)$/i, '');
      const candidates = [
        `${stem}.avif`, `${stem}.webp`, `${stem}-poster.avif`,
        `${base}.avif`, `${base}.webp`, `${base}-poster.avif`,
      ];
      if (!candidates.some((c) => existsSync(c))) {
        fail(rel(f), 'no poster frame found — every loop needs one or it pops in and shifts layout');
      }
    }
  }
}

function checkLicences(files) {
  const assets = files.filter((f) =>
    ['.glb', '.gltf', '.avif', '.webp', '.mp4', '.webm', '.hdr', '.exr'].includes(extname(f).toLowerCase())
  );
  if (assets.length === 0) return;

  if (!existsSync(LICENCES)) {
    fail('docs/asset-licences.md', 'licence registry missing — every 3D asset needs a recorded source and licence');
    return;
  }

  const registry = readFileSync(LICENCES, 'utf8');
  for (const f of assets) {
    const name = basename(f);
    if (!registry.includes(name)) {
      warn(rel(f), 'not listed in docs/asset-licences.md — record source, licence and attribution');
    }
  }
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

const files = walk(PUBLIC);

if (!existsSync(PUBLIC)) {
  notes.push('No public/ directory yet — nothing to validate. Gate is inert until assets land.');
} else {
  checkModels(files);
  checkStills(files);
  checkVideo(files);
  checkLicences(files);
}

const bar = '─'.repeat(66);
console.log(`\n${bar}\n  ASSET BUDGET GATE  —  ${files.length} file(s) under public/\n${bar}`);

for (const n of notes) console.log(`  ·  ${n}`);

if (warnings.length) {
  console.log(`\n  WARNINGS (${warnings.length})`);
  for (const w of warnings) console.log(`  !  ${w.file}\n     ${w.msg}`);
}

if (failures.length) {
  console.log(`\n  FAILURES (${failures.length})`);
  for (const f of failures) console.log(`  ✗  ${f.file}\n     ${f.msg}`);
  console.log(`\n${bar}\n  FAIL — fix the assets. Do not widen budgets.json to pass.\n${bar}\n`);
  process.exit(1);
}

console.log(`\n${bar}\n  PASS — all assets within budget.\n${bar}\n`);

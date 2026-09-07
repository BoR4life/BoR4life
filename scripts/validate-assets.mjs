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

/**
 * Extract the BIN chunk from a .glb container — where embedded texture bytes
 * live. Same failure contract as readGlbJson: null means "could not
 * inspect", never "passed".
 */
function readGlbBin(path) {
  try {
    const buf = readFileSync(path);
    if (buf.length < 20) return null;
    if (buf.readUInt32LE(0) !== 0x46546c67) return null; // 'glTF'
    const jsonLength = buf.readUInt32LE(12);
    // Chunks are 4-byte aligned; the BIN header sits immediately after the
    // padded JSON chunk.
    let offset = 20 + jsonLength;
    offset += (4 - (offset % 4)) % 4;
    if (offset + 8 > buf.length) return null;
    const binLength = buf.readUInt32LE(offset);
    if (buf.readUInt32LE(offset + 4) !== 0x004e4942) return null; // 'BIN\0'
    return buf.subarray(offset + 8, offset + 8 + binLength);
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

/**
 * Pixel dimensions of an embedded glTF image, without decoding it.
 *
 * PNG carries them in the IHDR chunk at a fixed offset. JPEG requires
 * walking the segment markers to a start-of-frame. Anything else returns
 * null rather than guessing — a wrong number here would either wave through
 * a texture that blows the memory budget or block a legitimate one.
 */
function imageSize(modelPath, gltf, img) {
  if (img.bufferView === undefined) return null;
  const view = gltf.bufferViews?.[img.bufferView];
  if (!view) return null;

  const bin = readGlbBin(modelPath);
  if (!bin) return null;

  const start = (view.byteOffset ?? 0);
  const bytes = bin.subarray(start, start + view.byteLength);

  // PNG: \x89PNG\r\n\x1a\n, then IHDR with width/height as big-endian u32.
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes[1] === 0x50) {
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }

  // JPEG: walk segments to any SOF marker (0xC0-0xCF, excluding the
  // non-frame markers 0xC4 / 0xC8 / 0xCC).
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) { i++; continue; }
      const marker = bytes[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      i += 2 + bytes.readUInt16BE(i + 2);
    }
  }

  return null;
}

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

    // GPU-resident texture memory.
    //
    // This used to require KTX2 and reject any embedded PNG/JPEG. That gate
    // could never pass here: the Basis transcoder KTX2 needs is Emscripten
    // embind, which builds invoker functions with `new Function`, and this
    // site's CSP forbids 'unsafe-eval' — so a KTX2 texture throws inside the
    // decoder worker and the model silently never renders. Requiring a
    // format the site cannot decode is not a strict gate, it is a broken
    // one.
    //
    // So measure the thing the format was a proxy for. An uncompressed
    // texture costs width * height * 4 bytes resident, plus a third again
    // for the mip chain, no matter how small the PNG is on disk — which is
    // why a 29KB file can cost 3.5MB of VRAM. Dimensions are the lever, and
    // this checks them directly.
    let gpuBytes = 0;
    for (const img of gltf.images ?? []) {
      if (img.uri && m.forbiddenTextureFormats.some((e) => img.uri.toLowerCase().endsWith(e))) {
        fail(rel(f), `references an external texture "${img.uri}" — embed it in the .glb so it cannot go missing`);
      }
      const dim = imageSize(f, gltf, img);
      if (!dim) continue;
      if (dim.width > m.maxTextureSize || dim.height > m.maxTextureSize) {
        fail(rel(f), `texture is ${dim.width}x${dim.height}, over the ${m.maxTextureSize}px limit`);
      }
      // 4 bytes per texel, x1.34 for the mip chain.
      gpuBytes += dim.width * dim.height * 4 * 1.34;
    }

    const gpuMb = gpuBytes / 1024 / 1024;
    if (m.maxGpuTextureMb && gpuMb > m.maxGpuTextureMb) {
      fail(rel(f), `textures need ~${gpuMb.toFixed(1)}MB of GPU memory, over the ${m.maxGpuTextureMb}MB budget — reduce texture dimensions`);
    } else if (gpuMb > 0) {
      notes.push(`${rel(f)}: ~${gpuMb.toFixed(1)}MB GPU texture memory (budget ${m.maxGpuTextureMb}MB)`);
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

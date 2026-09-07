#!/usr/bin/env bash
# Optimise a glTF/GLB for the web, in the order that actually matters.
#
#   ./scripts/optimize-gltf.sh input.glb public/models/hero-ward.glb [hero|secondary]
#
# Order is deliberate: strip and shrink BEFORE compressing, so compression
# is not spent on data that gets thrown away. Typical result on a real
# clinical scene: ~45MB source -> ~1.5MB shipped.
#
# Requires only what `npm ci` installs.
#
# GEOMETRY IS MESHOPT, NOT DRACO — and that is a hard constraint, not a
# preference. Draco's decoder is Emscripten embind, and embind builds its
# invoker functions at runtime with `new Function`. Under this site's CSP
# (no 'unsafe-eval', see lib/csp.ts) that throws EvalError inside the
# decoder worker and the model never appears — silently, because the poster
# underneath it looks exactly like a working page. The Basis/KTX2 transcoder
# is embind too, so texture supercompression is out for the same reason and
# textures are resized instead. meshoptimizer's decoder is hand-written and
# contains no eval at all, so it is the only compression here that a strict
# CSP can actually run. Do not "restore" Draco.

set -euo pipefail

IN="${1:?usage: optimize-gltf.sh <input.glb> <output.glb> [hero|secondary]}"
OUT="${2:?usage: optimize-gltf.sh <input.glb> <output.glb> [hero|secondary]}"
TIER="${3:-secondary}"

if [[ "$TIER" == "hero" ]]; then
  # 512, not the 2048 the budget permits: the only texture in this scene is
  # a wall-mounted monitor that is never more than a few hundred pixels tall
  # on screen. 2048 would cost 16MB of VRAM to render detail no visitor can
  # resolve.
  MAX_TEX=512
  TARGET_TRIS=150000
else
  MAX_TEX=512
  TARGET_TRIS=40000
fi

GT="npx --yes @gltf-transform/cli"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "==> optimising $IN  (tier: $TIER, max texture: ${MAX_TEX}px)"

echo "--> 1/6 dedup: merge duplicate accessors and materials"
$GT dedup "$IN" "$TMP/1.glb"

echo "--> 2/6 prune: strip unused nodes, materials, textures"
$GT prune "$TMP/1.glb" "$TMP/2.glb"

# Textures are shipped uncompressed, so this clamp is the ONLY thing
# standing between the scene and its GPU memory cost: an RGBA texture costs
# width*height*4 bytes in VRAM with mipmaps on top, regardless of how small
# the PNG is on disk. The bay's screen was 1024x640 — 29KB downloaded and
# 3.5MB resident.
echo "--> 3/6 resize: clamp textures to ${MAX_TEX}px"
$GT resize "$TMP/2.glb" "$TMP/3.glb" --width "$MAX_TEX" --height "$MAX_TEX"

echo "--> 4/6 weld + simplify: decimate toward ${TARGET_TRIS} triangles"
$GT weld "$TMP/3.glb" "$TMP/4.glb"
$GT simplify "$TMP/4.glb" "$TMP/5.glb" --ratio 0.75 --error 0.001

# join merges meshes that share a material. A procedurally built scene is
# one object per primitive — the bay exports ~65 separate cubes, which is
# ~65 draw calls against a budget of 80 before a single prop is added.
# Merging by material is what makes the draw-call budget survivable.
echo "--> 5/6 join: merge meshes sharing a material (draw calls)"
$GT join "$TMP/5.glb" "$TMP/6.glb" --keepNamed false

# No texture supercompression step. KTX2 is the only format that would
# reduce GPU-resident size, and its transcoder is embind — see the header.
# EXT_texture_webp would shrink the download but decodes to the same RGBA in
# VRAM, so against a 29KB PNG it buys nothing worth an extra extension.
echo "--> 6/6 meshopt: compress geometry"
$GT meshopt "$TMP/6.glb" "$OUT" --level medium

BEFORE=$(du -k "$IN"  | cut -f1)
AFTER=$(du -k "$OUT" | cut -f1)
echo "==> ${BEFORE}KB -> ${AFTER}KB"
echo "==> validating against budgets.json"
node "$(dirname "$0")/validate-assets.mjs"

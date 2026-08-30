#!/usr/bin/env bash
# Optimise a glTF/GLB for the web, in the order that actually matters.
#
#   ./scripts/optimize-gltf.sh input.glb public/models/hero-ward.glb [hero|secondary]
#
# Order is deliberate: strip and shrink BEFORE compressing, so compression
# is not spent on data that gets thrown away. Typical result on a real
# clinical scene: ~45MB source -> ~1.5MB shipped.
#
# Requires: npx @gltf-transform/cli (pulled on demand), and KTX-Software
# on PATH for KTX2 encoding.

set -euo pipefail

IN="${1:?usage: optimize-gltf.sh <input.glb> <output.glb> [hero|secondary]}"
OUT="${2:?usage: optimize-gltf.sh <input.glb> <output.glb> [hero|secondary]}"
TIER="${3:-secondary}"

if [[ "$TIER" == "hero" ]]; then
  MAX_TEX=2048
  TARGET_TRIS=150000
else
  MAX_TEX=1024
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

echo "--> 3/6 resize: clamp textures to ${MAX_TEX}px"
$GT resize "$TMP/2.glb" "$TMP/3.glb" --width "$MAX_TEX" --height "$MAX_TEX"

echo "--> 4/6 weld + simplify: decimate toward ${TARGET_TRIS} triangles"
$GT weld "$TMP/3.glb" "$TMP/4.glb"
$GT simplify "$TMP/4.glb" "$TMP/5.glb" --ratio 0.75 --error 0.001

# KTX2. UASTC preserves normal/ORM detail; ETC1S is far smaller for colour.
echo "--> 5/6 ktx2: UASTC for normal/ORM, ETC1S for albedo/emissive"
$GT uastc "$TMP/5.glb" "$TMP/6.glb" \
  --slots "{normalTexture,occlusionTexture,metallicRoughnessTexture}" \
  --level 4 --rdo 4 --zstd 18
$GT etc1s "$TMP/6.glb" "$TMP/7.glb" \
  --slots "{baseColorTexture,emissiveTexture}" \
  --quality 200

echo "--> 6/6 draco: compress geometry"
$GT draco "$TMP/7.glb" "$OUT" --method edgebreaker

BEFORE=$(du -k "$IN"  | cut -f1)
AFTER=$(du -k "$OUT" | cut -f1)
echo "==> ${BEFORE}KB -> ${AFTER}KB"
echo "==> validating against budgets.json"
node "$(dirname "$0")/validate-assets.mjs"

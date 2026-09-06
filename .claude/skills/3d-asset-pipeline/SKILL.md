---
name: 3d-asset-pipeline
description: Produce, optimise and ship 3D assets for the website — sourcing, Blender render recipes, glTF compression, budget validation, and the poster-first WebGL runtime. Use for any task involving 3D models, renders, turntables, or WebGL performance.
---

# 3D Asset Pipeline

Full spec: `docs/03-3d-production-spec.md`. Hard limits: `budgets.json`.
Reference implementations: `references/r3f-patterns.tsx`, `references/WardScene.tsx`.

## The shape of it

```
SOURCE → AUTHOR → OPTIMISE → VALIDATE → SHIP
```

~70% of the site's 3D is **pre-rendered stills**, most of the rest is
**pre-rendered loops**, and exactly **one** live WebGL scene.

## Source, in priority order

1. **Bundle of Rays' own Unity/Unreal product scenes.** Ask for these first,
   every time. They are the most authentic and differentiated 3D imagery
   available, cost nothing, and carry no licence risk.
2. Poly Haven (CC0) for HDRIs and textures; Quixel Megascans.
3. Sketchfab — check the licence **per model**; many are non-commercial.
4. AI generation — concepting and background matte only. **Never clinical
   equipment**: generated medical devices are subtly wrong in ways clinicians
   notice immediately, and being caught with a fake defibrillator costs far
   more credibility than the image is worth.

Record every asset in `docs/asset-licences.md` before it ships.

## Author

Look-dev rules that make a render read clinical rather than videogame:

- Soft, high-key, HDRI lighting. Real wards are bright and even; dramatic
  rim-lit darkness looks like a horror game and undermines the pedagogy.
- 35–50mm equivalent lens. Wide angle reads as amateur.
- Restrained depth of field. Heavy bokeh hides the detail that proves fidelity.
- Get stainless, PVC, vinyl and skin right — those four surfaces are 80% of
  clinical believability.

## Optimise

```bash
./scripts/optimize-gltf.sh source.glb public/models/hero-ward.glb hero
```

Order matters — strip and shrink before compressing:
dedup → prune → resize → weld/simplify → join → **meshopt**.

**Geometry is meshopt, never Draco, and textures are never KTX2.** Both of
those decoders are Emscripten embind, which builds invoker functions with
`new Function`; the site's CSP forbids `unsafe-eval`, so they throw inside
the decoder worker and the model silently never renders while the poster
underneath keeps the page looking correct. Texture memory is controlled by
the dimension clamp and `maxGpuTextureMb` instead. Full reasoning in
`docs/03-3d-production-spec.md`. Do not "restore" Draco.

If a model needs punishing compression to fit budget it was authored too
heavy. Send it back to look-dev rather than compressing it into mush.

## Validate

```bash
node scripts/validate-assets.mjs
```

Checks file sizes, triangle counts, draw calls, required compression
extensions, forbidden formats, poster frames and licence registration. Exits
non-zero on breach.

**Never edit `budgets.json` to make a failure pass.** Fix the asset, or put the
budget change to Brad as an explicit decision. Silently widening a gate removes
the only thing keeping the site fast as it grows.

## Ship

Copy `references/r3f-patterns.tsx` for the runtime. The rules it encodes:

- Poster-first — the still is the LCP element and is never removed from the DOM.
- Capability-gated — no WebGL2, low memory, save-data or reduced-motion means
  the canvas never mounts. That is a *faster* experience, not a degraded one.
- Lazy — `next/dynamic` + `IntersectionObserver`. Three.js is never in the
  initial bundle.
- Disposed on unmount, or mobile Safari kills the tab.
- `aria-hidden` canvas with a real adjacent text alternative. No fact lives
  only inside WebGL.
- The user moves the camera, or it holds still. No scroll-driven camera motion.

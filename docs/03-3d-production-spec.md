# 3D Production Spec

The answer to "what do we need to do to make this happen". Decisions are locked
here so the agent does not relitigate them on every run.

## The strategy: hybrid

Three ways to put 3D on a website. We use two of them, deliberately.

| Approach | Where we use it | Why |
|---|---|---|
| **Pre-rendered stills** (AVIF/WebP) | ~70% of all 3D on the site | Offline path-traced quality, loads instantly, works on every device, zero WebGL risk. This is the workhorse. |
| **Pre-rendered loops** (AV1/H.264) | Section heroes, module previews | Motion and atmosphere at video cost, not runtime cost. Poster frame mandatory. |
| **Live WebGL** (React Three Fiber) | **Exactly one** hero scene | The single interactive moment that proves this is an immersive-tech company. Earned, not sprayed. |

**Why one live scene and not ten.** Every WebGL scene is a permanent tax:
device-compatibility surface, memory pressure on mobile Safari, a main-thread
competitor to your LCP, and an accessibility problem to solve. One scene, built
properly, delivers ~90% of the credibility signal at ~10% of the risk. Ten
scenes is how a beautiful site becomes a slow site — and a slow site fails the
procurement reader on a hospital laptop, who is the buyer that matters most.

The hero scene should be the thing only you can show: a clinical environment
the visitor can look around, one they'd otherwise need a headset to see.

## Pipeline

```
  SOURCE            AUTHOR              OPTIMISE            VALIDATE      SHIP
  ──────            ──────              ────────            ────────      ────
  Licensed models   Blender scene    ┌─ still  → AVIF+WebP ─┐
  Poly Haven HDRIs  Look-dev         ├─ loop   → AV1+H264  ─┼─ validate ─→ /public
  AI-gen (concept)  Shot list        └─ live   → glTF      ─┘   -assets      /models
  Your Unity/UE     Camera + light        Draco + KTX2         .mjs
  product scenes                          gltf-transform
```

### Step 0 — Procedural, as a fallback and a baseline

`scripts/build_clinical_bay.py` builds, lights, renders and exports a complete
resuscitation bay from code, using Blender-as-a-module (`pip install bpy`). No
GUI, no `.blend` binary in version control — the scene is a reviewable diff, and
CI can regenerate every asset from scratch.

```bash
python scripts/build_clinical_bay.py --preview      # 960x540 look check
python scripts/build_clinical_bay.py --render-4k    # 3840x2160 hero still
python scripts/build_clinical_bay.py --export-gltf  # web model
```

**What it is:** a procedural blockout with deliberate look-dev — correct
clinical value range, soft high-key lighting, 32mm lens, AgX transform. Good
enough to art-direct against, to lock composition, and to use as a stylised
hero if that is the chosen direction.

**What it is not:** photoreal. There are no scanned textures, no CAD-accurate
equipment, no surface imperfection. Photorealism needs real source assets
(Quixel/Poly Haven textures, manufacturer-accurate device models) — see Step 1.

Use it to prove the pipeline and lock the shot before spending money on assets.

### Step 1 — Source

Priority order:

1. **Your own product scenes.** You build VR clinical environments already.
   Those Unity/Unreal assets are the most authentic, most differentiated 3D
   imagery available, and they are free. Exporting a ward, a resus bay or a
   manikin from an existing module beats anything licensable. **Start here.**
2. **Licensed models** — Sketchfab (check licence per model), Quixel Megascans,
   Poly Haven (CC0: HDRIs, textures, some models).
3. **AI generation** — usable for concepting, moodboards and background matte
   elements. Not usable for anything clinical: generated medical equipment is
   subtly wrong in ways clinicians notice instantly, and being caught with a
   fake defibrillator costs more credibility than the image buys.

**Licence discipline:** every asset gets a row in `docs/asset-licences.md`
(source URL, licence, author, attribution requirement, date). No row, no ship.
The validator fails the build on unregistered assets.

### Step 2 — Author

Look-dev rules that make renders read as *clinical* rather than *videogame*:

- **Lighting**: soft, high-key, HDRI-based. Real clinical spaces are bright
  and even. Dramatic rim-lit darkness looks like a horror game and undermines
  the pedagogy.
- **Lens**: 35–50mm equivalent. Wide-angle distortion reads as amateur.
- **Depth of field**: subtle, f/4-equivalent or tighter. Heavy bokeh hides the
  detail that proves fidelity.
- **Materials**: correct roughness on stainless, PVC, vinyl and skin. These are
  the four surfaces of a clinical environment and getting them right is 80% of
  believability.
- **No fake UI floating in the render** unless it is the actual product UI.

### Step 3 — Optimise

Run `scripts/optimize-gltf.sh` (wraps `gltf-transform`). It performs, in order:

1. `dedup` — merge duplicate accessors and materials
2. `prune` — strip unused nodes, materials, textures
3. `resize` — clamp textures to the budget max
4. `uastc`/`etc1s` — KTX2 texture compression
   - **UASTC** for normal and ORM maps (quality-critical, higher size)
   - **ETC1S** for albedo and emissive (size-critical)
5. `draco` — geometry compression
6. `weld` + `simplify` — vertex welding and decimation to the triangle budget

Typical result: a 45MB source glTF lands at 1.2–1.8MB. If it does not, the
model was authored too heavy — go back to step 2 rather than over-compressing
into mush.

### Step 4 — Validate

`node scripts/validate-assets.mjs` enforces `budgets.json` and **exits non-zero**
on any breach. Wire it into CI and the pre-commit hook. This is the mechanism
that stops the site degrading over time — every "just this once, it's only
400KB" is caught automatically.

## Runtime rules for the live scene

- **Lazy-loaded**, `next/dynamic` with `ssr: false`, behind an
  `IntersectionObserver`. The 3D chunk must never be in the initial bundle.
- **Poster-first**: render the pre-rendered still immediately; swap to canvas
  only once the model is decoded. The visitor sees the final composition at
  ~200ms, not a grey box at 2s. This alone protects LCP.
- **Capability gate**: no WebGL2, `deviceMemory < 4`, or save-data enabled →
  never load the canvas, keep the still. This is not a degraded experience;
  it is a fast one.
- **Frame budget**: 16.6ms. Cap `dpr` at `[1, 2]`, use `frameloop="demand"` for
  non-animated scenes, and one shadow-casting light maximum.
- **Dispose on unmount.** Geometries, materials and textures all leak otherwise,
  and mobile Safari will kill the tab.

## Accessibility for 3D — non-negotiable

The failure mode for immersive companies is shipping a site that excludes
people. For a healthcare-education vendor that is a credibility problem, not
just a compliance one.

- **No information exists only inside the canvas.** Every fact the 3D conveys
  is also in text.
- `aria-hidden="true"` on the canvas, with a real text alternative adjacent.
- **`prefers-reduced-motion: reduce`** → no autorotation, no scroll-scrub, no
  autoplay loops. Poster frames only.
- Any interactive control (orbit, hotspots) is **keyboard-operable** with a
  visible focus ring, or it does not ship.
- Vestibular safety: no involuntary camera motion on scroll. The user moves
  the camera, or it holds still.

## Deliverables checklist

- [ ] Shot list agreed (see `docs/02-content-architecture.md` for slots)
- [ ] Assets sourced and every licence recorded
- [ ] Look-dev frame approved before the full render run
- [ ] Stills: AVIF + WebP, alt text written for each
- [ ] Loops: AV1 + H.264 + poster frame
- [ ] Hero model: Draco + KTX2, under budget, validator green
- [ ] Reduced-motion and no-WebGL paths tested on a real device
- [ ] `validate-assets.mjs` passing in CI

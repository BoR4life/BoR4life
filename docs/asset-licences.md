# Asset Licence Registry

Every 3D asset, HDRI, texture and render that ships must have a row here
**before** it lands in `public/`. `scripts/validate-assets.mjs` warns on any
unregistered asset.

Why this is strict: Bundle of Rays sells to government and universities.
Procurement due diligence asks about third-party IP. "We think it was free on
Sketchfab" is not an answer you want to give a health department's legal team.

| File | Source | Author | Licence | Attribution required | Date added |
|---|---|---|---|---|---|
| _(example)_ `hero-ward.glb` | Bundle of Rays internal — resus module | In-house | Owned | No | — |
| _(example)_ `studio.hdr` | https://polyhaven.com/ | Poly Haven | CC0 | No | — |
| `hero-bay-poster.avif` | Generated in-repo by `scripts/build_clinical_bay.py` | Bundle of Rays | Owned | No | 2026-08-30 |
| `hero-bay-poster.webp` | Generated in-repo by `scripts/build_clinical_bay.py` | Bundle of Rays | Owned | No | 2026-08-30 |
| `bay-night.avif` | Generated in-repo by `scripts/build_clinical_bay.py --night` | Bundle of Rays | Owned | No | 2026-08-30 |
| `bay-night.webp` | Generated in-repo by `scripts/build_clinical_bay.py --night` | Bundle of Rays | Owned | No | 2026-08-30 |
| `frontier-state1.avif` | Generated in-repo by `scripts/build_frontier_state1.py` | Bundle of Rays | Owned | No | 2026-08-30 |
| `frontier-state1.webp` | Generated in-repo by `scripts/build_frontier_state1.py` | Bundle of Rays | Owned | No | 2026-08-30 |
| `pillar-environment.avif` | `scripts/build_clinical_bay.py --view bedside` | Bundle of Rays | Owned | No | 2026-08-30 |
| `pillar-environment.webp` | `scripts/build_clinical_bay.py --view bedside` | Bundle of Rays | Owned | No | 2026-08-30 |
| `pillar-analytics.avif` | `scripts/build_clinical_bay.py --view monitor` | Bundle of Rays | Owned | No | 2026-08-30 |
| `pillar-analytics.webp` | `scripts/build_clinical_bay.py --view monitor` | Bundle of Rays | Owned | No | 2026-08-30 |
| `og-default.png` | `scripts/make_og_card.py` | Bundle of Rays | Owned | No | 2026-08-30 |
| `video/scenario-av1.mp4` | In-headset capture, vascular access scenario (Brad, 2025-07-19) | Bundle of Rays | Owned | No | 2026-08-30 |
| `video/scenario-h264.mp4` | In-headset capture, vascular access scenario (Brad, 2025-07-19) | Bundle of Rays | Owned | No | 2026-08-30 |
| `video/scenario.avif` / `.webp` | Poster frame from the above | Bundle of Rays | Owned | No | 2026-08-30 |

> **Clearance outstanding on the scenario clip.** The footage is Bundle of
> Rays' own product with no third-party watermark, and the patient is
> synthetic — but if this scenario was built under contract for a specific
> client, that contract may restrict public display. Confirm before a
> production domain.

> **3D Organon footage is NOT usable.** A second video supplied on
> 2026-08-30 (`3dorganonweb.mp4`) is 3D Organon's anatomy platform,
> watermarked throughout. It is a third-party commercial product and
> presenting it on this site would misrepresent it as ours. Excluded unless
> a partnership and written permission exist.
| `assets/textures/vitals-screen.png` | `scripts/make_vitals_screen.py` — synthetic, not real patient data | Bundle of Rays | Owned | No | 2026-08-30 |
| `team-learning-development.avif` | Drive "Marketing Images" — `VR training group.jpg` | Bundle of Rays | Owned | No | 2026-08-30 |
| `team-learning-development.webp` | Drive "Marketing Images" — `VR training group.jpg` | Bundle of Rays | Owned | No | 2026-08-30 |
| `models/hero-bay.glb` | `scripts/build_clinical_bay.py` — procedurally generated, no third-party geometry | Bundle of Rays | Owned | No | 2026-08-30 |
| `video/scenario.webp` | Poster frame extracted from `VID_20250719_233639_579.mp4` (own capture) | Bundle of Rays | Owned | No | 2026-08-30 |

> **Model releases outstanding.** `team-learning-development.*` shows six
> identifiable adults. It came from a folder named "Marketing Images", which
> implies intent to publish, but **written consent has not been sighted**.
> Confirm with the pictured team (and their employer, whose uniform is
> visible) before this goes to a production domain. If any person declines,
> the image comes down — a face is not worth a relationship.

## Rules

- **Owned** (from your own Unity/Unreal product scenes) is always preferred —
  authentic, differentiated, and no licence risk.
- Sketchfab licences are **per model**. Check each one. Many are
  non-commercial and cannot be used here.
- CC-BY requires visible attribution — add it to `/about` or a colophon.
- AI-generated assets: record the model and prompt. **Never for clinical
  equipment** (see `docs/03-3d-production-spec.md`).

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
| `bay-night.avif` | Generated in-repo by `scripts/build_clinical_bay.py --night` — **retired Sept 2026, not shipped** | Bundle of Rays | Owned | No | 2026-08-30 |
| `bay-night.webp` | Generated in-repo by `scripts/build_clinical_bay.py --night` — **retired Sept 2026, not shipped** | Bundle of Rays | Owned | No | 2026-08-30 |
| `frontier-state1.avif` | Generated in-repo by `scripts/build_frontier_state1.py` — **retired Sept 2026, not shipped** | Bundle of Rays | Owned | No | 2026-08-30 |
| `frontier-state1.webp` | Generated in-repo by `scripts/build_frontier_state1.py` — **retired Sept 2026, not shipped** | Bundle of Rays | Owned | No | 2026-08-30 |
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
| `models/hero-bay.glb` | `scripts/build_clinical_bay.py` — procedurally generated, no third-party geometry — **retired Sept 2026, not shipped** | Bundle of Rays | Owned | No | 2026-08-30 |
| `bay-doorway.avif` | `scripts/build_clinical_bay.py --view doorway --web` | Bundle of Rays | Owned | No | 2026-08-30 |
| `bay-doorway.webp` | `scripts/build_clinical_bay.py --view doorway --web` | Bundle of Rays | Owned | No | 2026-08-30 |
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


## Typefaces

Both specified by the brand kit. Archivo carries display and interface,
Source Serif 4 carries body and long-form — an inversion of the usual
serif-display-over-sans-body, chosen because a serif body reads as a
document rather than a marketing page to a reader who assesses documents
for a living.

**Archivo** — `app/fonts/Archivo.var.woff2`

| | |
|---|---|
| Designer | Omnibus-Type |
| Licence | SIL Open Font License 1.1 |
| Source | Google Fonts, latin subset, variable (`wght` 100–900) |
| Size | 35KB |

**Source Serif 4** — `app/fonts/SourceSerif4.var.woff2`

| | |
|---|---|
| Designer | Frank Grießhammer, Adobe |
| Licence | SIL Open Font License 1.1 |
| Source | Google Fonts, latin subset, variable (`wght` 200–900, `opsz` 8–60) |
| Size | 122KB |

Both licences permit web embedding, self-hosting, commercial use and
unlimited page views. The OFL text must accompany any *redistribution of the
font files themselves*; serving them as part of a website is use, not
redistribution, so no attribution is required on the site.

157KB of type in total, against the 44KB the single previous face cost.
That is the real price of the brand kit and it was paid deliberately: the
serif is the larger half, and it is larger because it carries a genuine
optical-size axis, which is the thing a body serif most wants.

These replace **Inter Tight** (Rasmus Andersson, also OFL), which was
chosen here before the brand kit existed and had no authority behind it
beyond being a good screen face. Its files are removed.

Self-hosted rather than linked from Google's CDN, for two reasons that both
matter here: `font-src 'self'` in `lib/csp.ts` stays closed, so no third party
is contacted on a visitor's behalf and `/privacy` remains accurate; and there
is no extra DNS lookup and TLS handshake on the critical path to first text.

Only the latin subsets are vendored. If the site ever needs Cyrillic, Greek
or Vietnamese, fetch those subsets rather than the full faces — the
unicode-range split is what keeps this to 157KB.

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

## Rules

- **Owned** (from your own Unity/Unreal product scenes) is always preferred —
  authentic, differentiated, and no licence risk.
- Sketchfab licences are **per model**. Check each one. Many are
  non-commercial and cannot be used here.
- CC-BY requires visible attribution — add it to `/about` or a colophon.
- AI-generated assets: record the model and prompt. **Never for clinical
  equipment** (see `docs/03-3d-production-spec.md`).

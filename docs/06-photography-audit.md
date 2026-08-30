# Photography Audit — "Marketing Images" Drive folder

Audited 2026-08-30. Folder `1vl0eS4vJNUH3nyX8rjPIwZ3yTu_16gqH`, owned by
`bradley.chesham@gmail.com`, ~170 files, nothing newer than **November 2022**.

**Verdict: this folder cannot supply the photography the new site needs.**
Budget for a fresh shoot. Detail below so the decision is evidenced, not
asserted.

## What is actually in it

| Category | Count | Assessment |
|---|---|---|
| Unsplash stock | ~45 | Free to use, but this is the authenticity problem, not the solution |
| Facebook-downloaded copies | ~20 | 20–250KB, already re-compressed, many duplicates. Unusable at hero size |
| **LuminaX Demo Night 2021** | 4 | 8–10MB professional originals. **The only pro photography in the folder** |
| Real session photos, Aug–Nov 2022 | ~20 | Phone originals, 1.7–4.7MB. See "the masks problem" |
| `Engage_Tablet_*` product UI | ~18 | 2021 product UI. Historic reference only |
| Old website section images | 6 | `Vital Signs`, `Contextual Learning`, `Focused Immersion`, `Active autonomy`, `Remote capabilities`, `Education page` |
| Logos | 4 | TAFE, Queensland Government coat of arms, First Aid VR, `bundle.jpg` |
| Third-party marketing | 2 | HTC Vive Pro press image; a US VR market-size chart |

## The masks problem

A representative frame from the Aug 2022 set (`IMG_20220826_120649_787.jpg`,
1440×1440) shows a school classroom: a student in blazer and **face mask**
wearing a **Quest 2**, an instructor in a mask, and a seated audience of
uniformed students shot from behind.

Four disqualifying issues, and they apply to most of that shoot:

1. **Masks date the image instantly.** Nothing says "this company's best days
   were a few years ago" faster on a site whose entire pitch is *the new
   frontier*.
2. **Quest 2 is two hardware generations old.** A procurement reader who knows
   the market reads that as a vendor who has not reinvested.
3. **Wrong audience signal.** This is school outreach — uniformed minors. The
   site sells to health departments, universities and national programs.
   It undercuts the positioning rather than supporting it.
4. **Minors, and no evident releases.** Identifiable school students cannot be
   published without parent/guardian consent and school approval. For a
   healthcare-education vendor this is not a formality.

Composition is also snapshot-grade: backs of heads filling the foreground,
phone camera, mixed white balance. Not recoverable by grading.

## Legal flags — check before anything from here is reused

- **`qg-coa-ogp.png` is the Queensland Government coat of arms.** State arms
  are protected in Australia and commercial use is restricted without
  authorisation. Being a Queensland Health supplier does **not** confer the
  right to display the arms. Do not put it on the site; use a text credential
  ("Supplier to Queensland Health") only if QH approves the wording.
- **`157057-ar-vr-review-vive-pro-*.jpg` is an HTC press image.** Not ours.
- **`us-virtual-reality-market-size.png`** is a third-party research chart with
  unclear licensing. Rebuild the data ourselves or drop it.
- **TAFE logo** — client/partner marks need written permission per brand
  guidelines before appearing on the site.

## Recommendation

**Commission a half-day shoot.** It is the highest-leverage spend on the whole
project, because it is the one asset class 3D cannot produce (see the
"people come from photography" rule in `docs/01-art-direction.md`) and the one
competitors cannot copy.

Shot list:

1. **Clinician in current-generation headset**, mid-scenario, no mask —
   three-quarter, shallow depth, cold-teal grade.
2. **Two-person teaching moment** — educator observing a learner. This is the
   "clinician-led" proposition in one frame.
3. **Hands and controllers** in a real clinical space — detail, no faces, so
   it is consent-light and always usable.
4. **Headset off, debrief** — the reflective moment. Almost nobody in this
   market shoots it, and it is where the learning claim actually lives.
5. **Brad, environmental portrait**, clinical setting. The founder story is
   the differentiator; it deserves a real portrait, not a crop.
6. **Cutaways**: equipment, screens, the analytics dashboard on a real device.

Requirements: current-generation hardware, no masks, signed model releases for
every identifiable person, RAW capture, and a setting that reads clinical or
university — not a school classroom.

## Interim

Until that shoot exists, the site runs on 3D (`build_clinical_bay.py`,
`build_frontier_state1.py`) plus type and data. That is a deliberate,
defensible look — and far better than dated stock. **No Unsplash on the
production site**; using it would reproduce the exact genericism the rebuild
is meant to fix.

The four LuminaX Demo Night originals are worth reviewing individually —
professional capture, but 2021, so check hardware and masks before use.

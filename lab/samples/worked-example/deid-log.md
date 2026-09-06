# De-identification log — SAMPLE-rhythm-00

**Worked example built from `lab/samples/dirty-01-rhythm.md`, which is
fabricated. No real patient, contributor, clinician or facility appears
here.** This exists to show the shape of a completed log, and to give the
scanner a clean file to prove itself against.

Scanner run: `npm run lab:scan -- lab/samples/dirty-01-rhythm.md`
Result: 13 BLOCK, 8 FLAG
Re-scan after edits (`structured.md`): 0 BLOCK, 2 FLAG — both decided below

| Line | Finding | What it was | Decision | Reason |
| --- | --- | --- | --- | --- |
| 9 | Capitalised word pair | Patient's full name | removed | Name. Never appears in any form. |
| 9 | Record identifier | Patient's URN | removed | Checklist item 1. |
| 9 | Date of birth | Full DOB | generalised | Age in years is permitted and carries the clinical weight; the birth date carries none. Kept as "68". |
| 9 | Four-digit year | Birth year | removed | Reconstructs the DOB. |
| 11 | Calendar date with a day | Admission date | generalised | Kept as "late winter". Season is permitted; the day narrows to one shift on one unit. |
| 11 | Proper name after a cue | Husband's first name | removed | A relative's name identifies the patient as surely as her own. |
| 11 | Roster detail | "night duty on \[date\]" | generalised | Kept as "overnight". The time of day matters to the case — thin staffing, no cardiology in the building. The roster does not. |
| 14 | Bed number | Bed and resus bay numbers | generalised | Kept as "a resuscitation bay". The escalation of care is the clinical fact; the bed number is a coordinate. |
| 16 | Named clinician ×2 | Cardiology registrar, senior nurse | generalised | Kept by role. The disagreement between them is the whole teaching point and survives without names. |
| 18 | Medicare-shaped number | Medicare number | removed | Checklist item 1. |
| 19 | Occupation / public role | "the local publican's wife" | removed | Occupation is not clinically load-bearing here — it explains nothing about the arrhythmia — and in a small coastal catchment it names her. |
| 19 | Recognised locally | "everyone on the unit knows her" | removed | States outright that re-identification has already happened. Removing it does not weaken the case; leaving it would have ended it. |
| 23 | Named clinician | Prescribing GP | generalised | Kept as "her general practitioner". |
| 23 | Named facility | The GP practice, wrapped across two lines | removed | Small named practice plus an unusual amiodarone-cessation history is a mosaic. The prescribing history is kept; the practice is not. |
| 25 | Phone number | Contributor's mobile | removed | Contact routing, not case content. Held in the contributor register instead. |
| 26 | Email address | Contributor's work email | removed | As above. |
| — | Capitalised word pair | Contributor's name in the byline | **kept** | Contributor, credited by name with consent. This is the model, not a leak. |

## Residual flags on `structured.md`

| Finding | Decision | Reason |
| --- | --- | --- |
| Capitalised pair — contributor byline "Jenny Rowe" | kept | Contributor, credited by name with consent. This is the model, not a leak. |
| Four-digit year — "2026" in the case ID | kept | Issue year in the file's own identifier, not an event date. The admission is carried as "late winter" only. |

Two flags, both accepted. Note what is *not* in this list: the case retains
no occupation, no facility name, no clock time and no year of admission, so
none of those rules fire at all.

## Mosaic assessment

- **Would a colleague on that unit know who this is?** Reduced but not
  eliminated. What remains is a 68-year-old woman, AF with RVR, unstable,
  cardioverted, late winter. That is a common presentation in a coronary care
  unit, and the season spans about ninety days. Judged acceptable.
- **Is the presentation rare enough that the unit plus the season narrows
  it?** No. AF with rapid ventricular response and haemodynamic compromise is
  routine in this setting, which is precisely why it was chosen for issue
  one. The magnesium of 0.62 is the only unusual detail and it is not
  memorable on its own.
- **Does any combination narrow it further than any single detail?** The
  combination that did was occupation plus small catchment plus "everyone
  knows her". All three are gone. The amiodarone-cessation history plus a
  named practice was the second; the practice is gone.

**Assessment:** the case can be published once the residual flags above are
accepted and clinical review is complete.

## Sign-off

- Prepared by: agent — 6 Sep 2026
- De-identification approved by: **[HUMAN SIGN-OFF REQUIRED — NOT GIVEN]**
- Clinical review 1: [pending]
- Clinical review 2: [pending]

Sign-off is a human act. This log records what the agent did; it does not
approve it.

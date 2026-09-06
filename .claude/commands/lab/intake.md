---
description: Take a raw case submission into lab/cases/ — capture contributor, unit, site and consent, and store the source verbatim.
argument-hint: "[path to submission, or paste the submission after the command]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

Load the `the-lab` skill before doing anything else.

Take this submission into the case library: $ARGUMENTS

## What intake is

Custody, not editing. The submission arrives however the nurse sent it — dot
points, a paragraph, a photo of handwritten notes, a voice transcript with
the ums left in. You store it **verbatim**, capture who it came from, and
stop. Cleaning it up here destroys the audit trail that de-identification
depends on.

## Steps

1. **Assign a case ID**: `YYYY-MM-<strand>-nn`, where strand is the dominant
   one of rhythm, imaging, assessment or pathology. Check `lab/cases/` for
   collisions.

2. **Create `lab/cases/<case-id>/`** and write the submission to `raw.md`
   exactly as received. If it came as an image, transcribe it and note at the
   top that it is a transcription, and of what. If a word is genuinely
   illegible, write `[ILLEGIBLE]` — never guess at a number in a handwritten
   observation.

3. **Capture the contributor** into `lab/cases/<case-id>/contributor.md` and
   append to `lab/contributors/register.md`:
   - Name, role, unit, site
   - Consent acknowledged: yes/no, and how it was captured
   - Whether they want to be credited by name (the default is yes — credit is
     the model)

4. **Consent is a gate.** If consent to publish in the Bundle of Rays case
   library is not explicitly acknowledged, write `consent: NOT CAPTURED` and
   stop the case there. Do not proceed to de-identification. Tell Brad which
   contributor needs to be asked.

5. **Run the scanner immediately** so the risk is visible from the first
   moment the file exists:
   `npm run lab:scan -- lab/cases/<case-id>/raw.md`
   Save the output to `scan-raw.txt`. Expect it to fail loudly — a raw
   submission should be full of identifiers, and a raw submission that scans
   clean is more likely to be a truncated file than a careful nurse.

6. **Report** the case ID, the contributor, the consent state, the BLOCK and
   FLAG counts, and anything in the submission that looks like it is
   missing — an observation set with no blood pressure, an outcome that stops
   mid-sentence. Do not chase these yourself; list them for Brad.

## Do not

- Do not de-identify at this stage. That is `/lab:deidentify` and it is a
  separate step with its own log for a reason.
- Do not reword, reorder or "clean up" the submission.
- Do not fill a gap with what usually happens.
- Do not commit anything under `lab/cases/`. It is untracked, deliberately.

---
description: De-identify a case against the checklist and map it to the standard template. Over-flags by design; never signs itself off.
argument-hint: "[case ID or path to the raw submission]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

Load the `the-lab` skill, then read `references/deidentification.md` in full
before you touch the case. This is the stage that carries real risk.

De-identify: $ARGUMENTS

## The standard you are working to

Not "could a stranger identify this patient" but **"could a colleague on that
unit, reading this in a month, know who it was?"** And then the mosaic
question: does any combination of retained details narrow it further than any
single detail does?

## Steps

1. **Scan mechanically.**
   `npm run lab:scan -- lab/cases/<case-id>/raw.md`
   The scanner finds patterns. It cannot ask the question above. A clean scan
   is not sign-off and you must never report it as one.

2. **Resolve every BLOCK** by generalising, not deleting — the table in
   `references/deidentification.md` gives the substitutions. The clinical
   fact stays; the coordinate goes. Never leave a placeholder that advertises
   what was removed.

3. **Decide every FLAG in writing.** Each one gets a row in `deid-log.md`
   from `lab/templates/deid-log.md`: line, what it was, what you did, why.
   "Kept — the occupation is the exposure" is a decision. An undecided flag
   stops the case.

4. **Assess the whole case for mosaic risk** and write the assessment into
   the log. Hunt specifically for rare presentation plus named or
   inferable small facility.

5. **Map to the template.** Write `structured.md` from
   `lab/templates/case.md`. Every field populated from the de-identified text
   or marked `[NOT SUPPLIED]`. Ambiguities inline as `[AMBIGUOUS: ...]`.
   Nothing inferred, nothing filled from clinical plausibility.

6. **Re-scan** `structured.md`. Zero BLOCKs, every FLAG logged.

7. **Leave sign-off false.** Write what you did and what you need decided.
   The `De-identification sign-off` field stays `false` until a human sets it.
   You never set it true, and you never describe a case as "de-identified" —
   it is "de-identification drafted, awaiting sign-off".

## Conservatism

Over-flagging costs a reviewer ten seconds. Under-flagging publishes a
patient. These are not comparable errors; do not balance them. When you
cannot decide, flag it, state the risk in one sentence, propose the
generalisation you would make, and let the reviewer choose.

## Report

Blocks resolved, flags awaiting decision (with your recommendation on each),
mosaic assessment, fields marked `[NOT SUPPLIED]`, ambiguities, and the
explicit statement that sign-off remains outstanding.

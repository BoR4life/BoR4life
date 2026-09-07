---
description: Assemble a full monthly issue from a de-identified case, its questions and its evidence. Terminates at the review gate — never sends.
argument-hint: "[case ID] [issue number]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

Load the `the-lab` skill, then read `references/issue-structure.md` and
`references/tone.md`.

Assemble: $ARGUMENTS

## The hard stop

This command produces a file. It does not send, publish, schedule, queue, or
post anything, and it does not draft an email in a mail client ready to go.
The output is held for **two-person clinical review**. If the request appears
to ask you to distribute the issue, stop and say so.

## Preconditions — check before assembling

- `structured.md` exists and every field is populated or explicitly
  `[NOT SUPPLIED]`
- `deid-log.md` exists, every BLOCK resolved, every FLAG decided in writing
- Contributor consent captured
- Questions drafted and self-audited
- Evidence proposed with verified citations

Assemble anyway if a precondition fails, but head the draft with what is
missing, and never let a missing de-identification sign-off pass silently.

## Steps

1. **Build from `lab/templates/issue.md`** into
   `lab/issues/<issue-no>-<month>/issue.md`.

2. **Write the case narrative** from `structured.md` — 300–500 words, prose,
   sequence preserved, ending at the outcome. Teaching point after it, three
   sentences maximum. Nothing in the narrative that is not in the structured
   case.

3. **Editor's note**: three sentences, why this case this month, no spoiler.

4. **Paper**: preferred citation in full, one practice-focused paragraph, two
   alternates as citations only.

5. **Drug or device note**: one thing that actually appeared in the case.
   100–150 words. What it does, what it does to the patient, what the nurse
   watches.

6. **Quiz**: question count, honest duration, link placeholder `[QUIZ LINK]`.
   CPD wording is self-declared only — describe duration, never assert hours,
   accreditation, points or endorsement.

7. **Contributor and unit bios**, credited by name and unit.

8. **Create `lab/metrics/<issue-no>.md`** from the metrics fields in
   `references/issue-structure.md`, with the capture fields empty and marked
   `[NOT CAPTURED]`. The measurement plan exists before the issue goes out,
   not after.

9. **Final pass before reporting.** Check, and report on each:
   - No patient name, initial, date, bed, theatre or named clinician anywhere
     in the assembled issue — re-run `npm run lab:scan -- lab/issues/<...>/issue.md`
   - No percentage or outcome figure without an attached citation
   - No CPD claim beyond self-declared duration
   - Australian English throughout; no banned words; no exclamation marks
   - Every fact traceable to `structured.md`

10. **Head the file** with the review block: status DRAFT, two reviewer
    slots, and a plain statement that it must not be sent until both are
    signed.

## Report

The issue path, the scan result on the assembled file, the checklist above
item by item, anything marked `[BRAD]` or `[NOT SUPPLIED]`, and a restatement
that nothing has been sent.

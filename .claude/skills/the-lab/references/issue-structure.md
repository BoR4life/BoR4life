# Issue structure and metrics

## What an issue contains

In this order, every month:

1. **Masthead** — The Lab, *Curiosity at the bedside*, issue number, month.
2. **Editor's note** — three sentences at most. What this month's case is
   about and why it was chosen. Never a summary of the case; it spoils it.
3. **The case** — narrative, 300–500 words, ending at the outcome. The
   teaching point sits after it, set apart.
4. **The paper** — one preferred paper, full citation, one practice-focused
   paragraph. Two alternates listed with citations only.
5. **Drug or device note** — 100–150 words on one thing that appeared in the
   case. Practical: what it does, what it does to the patient, what the nurse
   watches.
6. **The quiz** — link to the web form. Four to six questions, stated
   duration, self-declared CPD wording only.
7. **The reflection** — what the participant is left holding. Not a
   certificate. See below.
8. **Contributor** — name, role, unit, two-to-three-sentence bio.
9. **Unit bio** — what this unit sees, who walks through the door.
10. **Footer** — what The Lab is, how to submit a case, how to unsubscribe.

## Phase one delivery

Email, plain and readable on a phone in a corridor. No tracking beyond open
rate and the quiz form. No attachments. No login. The quiz is a web form and
the link is the only call to action in the issue.

## The reflection artefact

The quiz knows which decision the participant got wrong and why the
distractor was attractive. That is the identified learning need, arrived at
from performance rather than from a blank page — which is the part of a CPD
record nurses find hardest and leave until an audit letter arrives.

So every completion returns a **draft reflection** in the participant's own
record: the activity, the gap their answer exposed, what the correct
reasoning was, and one sentence on what they will do differently. Four
sentences. Theirs to edit, keep, or discard.

This is deliberately the opposite of a certificate, and the reason is in
`cpd-requirements.md`: a certificate does not meet what the NMBA asks for at
audit, and a reflection tied to a demonstrated gap does. Read that file
before writing any participant-facing CPD wording.

The hard limits do not move. The Lab describes duration and nothing else. It
never asserts hours, accreditation, endorsement or points, and the reflection
is the participant's record of their own learning, never The Lab's claim
about it.

## Data captured per issue

This is the evidence base for the Queensland pitch in phase two, so it is
captured from issue one and stored in `lab/metrics/<issue>.md`. Retrofitting
it later is not possible.

- Issue number, month, theme, contributing unit
- Quiz completion count, broken down by site and by role
- Score distribution per question, not just per participant
- Open rate

Record what was actually measured. Where a figure is missing, write
`[NOT CAPTURED]` — an estimated completion rate in a pitch deck is worse than
a gap, because it will be asked about.

### Designed measures — build these in from issue one

These are not opportunistic extras. They are the argument, and none of them
can be reconstructed later, so the form has to carry them from the first
issue or they are lost.

- **Decision accuracy, per question.** Which decision the cohort got wrong is
  more useful than the mean score, and it is the only number that says
  anything about practice rather than engagement.
- **Repeat participation.** How many people complete more than one issue.
  A newsletter has readers; a program has returners.
- **Authoring conversion.** How many participants go on to submit a case.
  This is the number that distinguishes a peer-led model from a broadcast
  one, and it is the whole premise of The Lab.
- **Matched pre/post items where a topic recurs.** When a later issue tests
  the same decision as an earlier one, the same item goes in both. Two
  points on the same item across the same cohort is the only honest efficacy
  claim available at this scale, and it costs nothing but planning.
- **Unit-level rollup.** Completion and decision accuracy by contributing
  unit, not only by site. The unit is the meaningful cohort clinically and
  the meaningful buyer commercially.

**No figure from any of these is published as an efficacy claim without the
standing citation rule being met.** Internal numbers may be reported as
internal numbers, described as such, with the denominator stated. "Completion
rose" without an n is the kind of claim that ends a program's credibility the
first time a procurement officer asks.

## What the issue never does

- Assert accreditation, CPD hours or points.
- Name a patient, a treating clinician, a bed, or a date.
- Publish an outcome percentage without a citation.
- Claim endorsement by a hospital, group or regulator.
- Send itself. The issue is a file, marked for review, until a human sends it.

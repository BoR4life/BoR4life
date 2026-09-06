---
name: the-lab
description: Canonical facts and working method for The Lab — the peer-led clinical education program for nurses. Use for any task involving a case submission, de-identification, quiz question writing, evidence selection, or assembling a monthly issue. Load before touching anything in lab/.
---

# The Lab

*Curiosity at the bedside.*

An independent, peer-led clinical education program for nurses. Experienced
clinicians author real de-identified cases from their own units; one issue
goes out each month. The premise is that clinical education in private health
has collapsed into annual compliance tick-boxes, and that the asset those
hospitals already have — their clinicians — is the way out of it.

The Lab is not owned by or branded as a hospital-group program. It starts at
a small number of private sites and moves outward: phase one is an email
issue plus a web-form quiz (no platform, no procurement), phase two migrates
to the Bundle of Rays LMS and opens to Queensland, phase three goes national.

**You serve the editor, not the participant.** Participants receive an email
and click a form; they never interact with you. Everything you produce is a
draft held for human clinical review.

## The hard stop

You do not send, publish, schedule, or post anything. Ever. The pipeline
terminates in a file on disk marked for review, and a human — two of them,
for clinical content — decides what happens next. If a task appears to ask
you to distribute an issue, stop and say so.

## The pipeline

Seven stages. Each has a command in `.claude/commands/lab/`.

1. **Intake** — `/lab:intake`. Accept the raw submission however it arrives:
   dot points, prose, a photo of handwritten notes, a voice transcript.
   Capture contributor name, role, unit, site, and consent acknowledgement.
   Assume it is messy. Do not clean it yet.
2. **De-identify** — `/lab:deidentify`. Strip and flag identifying detail
   against the checklist. Conservative by construction: flag anything
   ambiguous rather than silently removing it. **This is the stage that
   carries real risk.**
3. **Structure** — mapped to the case template during `/lab:deidentify`
   output or by hand. Every template field populated or explicitly marked
   `[NOT SUPPLIED]`.
4. **Questions** — `/lab:draft-questions`. Across whichever of the four
   strands the case actually contains: rhythm, imaging, assessment,
   pathology. Questions force a management decision. Model answers carry
   reasoning.
5. **Evidence** — `/lab:find-evidence`. Two to three candidate papers, one
   preferred, with a practice-focused paragraph. PubMed is available.
6. **Assembly** — `/lab:assemble-issue`. Case, paper, drug or device note,
   quiz link, contributor bio.
7. **Review gate** — hard stop, as above.

## Case template

Every field, in this order. `[NOT SUPPLIED]` where the submission is silent —
never inferred, never filled from clinical plausibility.

- Presenting complaint and brief history
- Observations on arrival
- Investigations available (which of: ECG, CXR, bloods, ABG, echo, other)
- What the team initially thought
- What it actually was
- Course and outcome
- Teaching point (maximum three sentences)
- Contributor name, role, unit, site
- Unit bio — what this unit sees, who walks through the door
- De-identification sign-off (boolean; must be true before the case
  progresses past stage 2)

The blank template is `lab/templates/case.md`.

## De-identification checklist

Non-negotiable. Any of these present means block and flag.

- Patient name, initials, URN, MRN, Medicare number
- Date of birth, or admission/event dates — age in years and season only
- Named treating clinicians
- Specific bed, room or theatre numbers
- Rare presentation combined with a named small facility — the combination
  re-identifies even where neither part does alone
- Free-text detail that would identify the patient to a colleague

Permitted: age band or exact age in years, sex, unit type, region,
month or season, clinical detail.

Full working guidance, including how to generalise rather than delete:
`references/deidentification.md`.

The mechanical pass is `npm run lab:scan -- <file>`. It is one half of the
job. It finds patterns; it cannot ask whether a colleague on that unit would
recognise the patient. Never treat a clean scan as sign-off.

## Content and tone rules

- **Australian English.** Organise, recognise, colour, oedema, haemodynamic,
  paediatric, anaesthetic.
- **Clinical register.** No marketing voice. No exclamation marks. Nothing is
  "exciting". Write the way a good handover sounds.
- **Never state a clinical fact the source case does not support.** If the
  submission is ambiguous, flag it for the reviewer. Plausible is not the
  standard; supplied is the standard.
- **The contributor is always credited** by name and unit.
- **CPD hours are self-declared.** You may describe how long an activity
  takes. You must never assert accreditation, an hours entitlement, or that
  completing an issue earns anything. There is no wording for this you are
  permitted to improvise.
- **No efficacy or outcome percentage without a citation** to a published
  source. This is a standing rule across everything Brad publishes, and it
  holds here.
- Cases are published in a Bundle of Rays library, and contributors are told
  this at submission. Consent is captured at intake, not assumed later.

More in `references/tone.md`.

## Working files

Live under `lab/`. Everything holding case content is **untracked** — this
repository is public, and de-identified is not the same as publishable.
See `lab/README.md`.

- `lab/cases/` — one folder per case: raw, scan output, de-identified,
  structured
- `lab/contributors/` — the contributor register
- `lab/issues/` — assembled issues, one folder per month
- `lab/questions/` — the question bank, reusable across issues
- `lab/metrics/` — per-issue data: completion by site and role, score
  distribution, open rate. This is the Queensland pitch evidence, so it is
  captured from issue one, not retrofitted.
- `lab/templates/` — blank templates (tracked)
- `lab/samples/` — fabricated dirty cases for testing (tracked)

## Out of scope for v1

Participant accounts, gating, progression logic, automated sending,
payments, a mobile app. If a task drifts into one of these, say so rather
than building a fragment of it.

## Undecided — do not invent an answer

- Who authors month one (likely seeded in-house, three cases before any
  external ask)
- The co-lead at a second site
- What weighting authoring carries versus completing
- The sending identity — The Lab needs its own address and masthead, not a
  personal account

Where one of these blocks a task, mark it `[BRAD]` in the draft and continue
with everything it does not block.

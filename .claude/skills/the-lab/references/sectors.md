# Sectors — private acute, and residential aged care

The Lab was specified for private acute hospitals. The format ports to
residential aged care, but not unchanged, and the differences are not
cosmetic. This file is what the agent needs to know before drafting anything
for an aged care audience.

## Why aged care is a different product, not a different audience

**In acute, CPD is an individual's problem. In residential aged care it is
the provider's legal obligation.**

Under the strengthened Aged Care Quality Standards, in force from
1 November 2025 under the *Aged Care Act 2024*, providers must map
role-specific competencies and run regular **competency-based training and
assessment**, keeping training and competency records for every worker,
contractors included. Regular competency assessment is required to show
workers have the skills to deliver safe care.

Sources:
- Aged Care Quality and Safety Commission, workforce obligations —
  https://www.agedcarequality.gov.au/providers/workforce-obligations
- Strengthened Aged Care Quality Standards —
  https://www.agedcarequality.gov.au/providers/quality-standards/strengthened-aged-care-quality-standards
- Department of Health, *Strengthened Aged Care Quality Standards*, August 2025 —
  https://www.health.gov.au/sites/default/files/2025-08/strengthened-aged-care-quality-standards-august-2025.pdf

The consequence for The Lab is precise: **an hours tally is not what this
sector is asked for, and a completion certificate is not either. An assessed
decision, recorded against a named role competency, is.** A scored decision
question already produces that; it just has to be labelled as what it is.

## Who the workforce actually is

Around **48% of residential aged care employees are personal care workers**,
and about **18% are in nursing roles** (AIHW GEN, aged care workforce —
https://www.gen-agedcaredata.gov.au/topics/aged-care-workforce).

Two things follow, and both are easy to get wrong:

1. **Roughly half the workforce has no Ahpra CPD requirement at all.** PCAs
   and AINs are not registered practitioners. Everything written about
   self-declared hours in `cpd-requirements.md` is irrelevant to them — but
   the provider's obligation to evidence *their* competency is not. Never
   write CPD-hours framing into material aimed at unregulated staff.
2. **The largest group at the bedside is the group least often written for.**
   Almost every CPD product in this market is pitched at registered nurses.
   The person who first notices a resident is not right is usually a PCA.

Registered nurse coverage is thin by design: at least one RN must be on site
and on duty at all times in each approved residential home
(https://www.health.gov.au/our-work/care-minutes-registered-nurses-aged-care/24-7-rns).
One RN, a whole home, overnight, no doctor in the building. That is the
decision environment the case has to be written for.

## Role-scoped questions

**One case, one set of facts, different decisions by scope.** This is the
single most important adaptation and it is not optional.

- **PCA / AIN.** What do you notice, and what do you escalate, and in what
  words? Never a question about drugs, doses or diagnoses. The right answer
  is almost always "say the specific thing you saw, to the RN, now" — and
  the distractors are the real-world alternatives: wait for the next round,
  write it in the notes, mention it at handover, tell the family.
- **EN.** Observation, interpretation within scope, and escalation.
- **RN.** Management decisions, escalation to the GP or nurse practitioner,
  when transfer is and is not the right answer.

**Plain English for the PCA questions, deliberately.** A large share of this
workforce speaks English as an additional language. A stem written in
clinical register will test reading, not judgement, and produce a competency
record that means nothing. Short sentences, no abbreviations, no Latin, no
double negatives. Judge the stem on whether the decision is hard, not the
wording.

## The clinical problem worth aiming at

Recognising deterioration before it is measurable, and deciding whether a
resident needs to go to hospital. It is the right target for three reasons:
it is the commonest high-stakes decision in the setting; it is measured in
the Quality Indicator Program as ED presentations and hospital admissions;
and there is Australian evidence that some of it is avoidable.

Published estimates put **13–40% of hospital admissions involving a resident
as potentially avoidable**, and one regional Australian study found **55.6%
of ED presentations from residential aged care were avoidable**. Cite the
source with the figure, always — see `tone.md`. Starting points:
- https://www.publish.csiro.au/AH/AH24230
- https://pubmed.ncbi.nlm.nih.gov/36961100/

**There is a directly relevant Australian precedent.** The Early Detection of
Deterioration in Elderly Residents (EDDIE+) program is a multi-component
intervention that empowers nursing *and personal care* workers to detect and
manage early deterioration, using education, decision support tools,
diagnostic equipment and on-site facilitation. It was evaluated in a
stepped-wedge cluster randomised trial across 12 Queensland residential aged
care homes, with hospital bed days as the primary outcome.

- Carter HE, Lee XJ, Farrington A, et al. *A stepped-wedge randomised
  controlled trial assessing the implementation, effectiveness and
  cost-consequences of the EDDIE+ hospital avoidance program in 12
  residential aged care homes: study protocol.* BMC Geriatr. 2021;21(1):347.
  doi:10.1186/s12877-021-02294-8 · PMID 34090368
- Allen MJ, Carter HE, Cyarto E, et al. *From pilot to a multi-site trial:
  refining the Early Detection of Deterioration in Elderly Residents (EDDIE+)
  intervention.* BMC Geriatr. 2023;23(1):811.
  doi:10.1186/s12877-023-04491-z · PMID 38057722

Read these before drafting an aged care case. Two reasons. They establish
that the education-plus-decision-support shape is a researched intervention
rather than a marketing idea, which matters when talking to a clinical
governance lead. And the components they found hardest to sustain — on-site
facilitation, diagnostic equipment — are exactly the parts The Lab does not
have and does not need. Say what The Lab is: a low-cost, scalable version of
the education and decision-support component, and nothing more. **Do not
claim EDDIE's outcomes as The Lab's.** Different intervention, different
evidence.

## De-identification is harder here, not easier

A residential home may have sixty residents and a stable staff group who know
every one of them. A distinctive presentation in a named home identifies the
resident to every worker there, and often to families. The mosaic rule in
`deidentification.md` binds harder in this setting than in a hospital ward:

- Season plus home plus an unusual presentation is frequently enough.
  Consider dropping season entirely for aged care cases.
- Resident-specific detail that reads as harmless in acute — a cultural
  background, a language spoken, a family circumstance, a room location, a
  behaviour, a long length of stay — is often the identifying detail here,
  because the population is small and stable.
- Deaths are common in this setting and a death makes a case memorable.
  Treat any case involving a death as high risk by default.
- **Where a case cannot be published without identifying the resident, the
  answer is consent from the resident or their substitute decision-maker, not
  a cleverer redaction.**

## Competency mapping

Where an issue is produced for an aged care provider, each question carries
the role competency it assesses, in the provider's own words where they have
supplied a framework. The output of a completion is then two things: the
participant's draft reflection (see `cpd-requirements.md`, for registered
staff only) and **an assessed-competency record naming the role, the
competency, the decision tested and the result** — which is what the provider
must hold under the Standards.

The agent drafts that record. It never asserts that a competency is met.
Competency determination is the provider's, made by a person with the
authority to make it, exactly as de-identification sign-off is.

## Private acute — what is different

Large private groups run their own graduate programs and internal clinical
education, at scale. The Lab is not a substitute for that and should never be
positioned as one. In acute, its role is the thing an internal program
structurally cannot do: cases from *this* unit, authored by *these* nurses,
in the month it happened. Everything in this file about role-scoping applies
in acute too, less starkly — the AIN who says "she just doesn't look right"
is in both settings.

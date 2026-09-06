# De-identification — working guidance

The checklist in `SKILL.md` says what must not survive. This says how to
remove it without destroying the case, and where the judgement sits.

## The standard

Not "could a stranger identify this patient" but **"could a colleague on that
unit, reading this in a month, know who it was?"** That is a much lower bar
and it is the one that matters, because the audience for this newsletter is
the staff of the hospitals the cases come from. A case that is anonymous to
Queensland Health and obvious to the ward that treated the patient has failed.

The second standard is the mosaic. No single detail here is identifying:
34-year-old man, trail bike, diaphragmatic rupture, September. Together, in a
catchment of forty thousand people served by one trauma-taking hospital, they
name him. **Combinations re-identify. Assess the case whole, not field by
field.**

## Generalise, do not delete

Deleting detail costs the teaching point. Generalising usually does not.

| Submitted | Wrong | Right |
| --- | --- | --- |
| `admitted 22 September 2026` | `admitted [DATE]` | `admitted in spring` |
| `68F, DOB 14/03/1958` | `[AGE]F` | `68F` — exact age in years is permitted |
| `Dr Hargreaves, cardiology reg` | `[REDACTED]` | `the cardiology registrar` |
| `bed 4, resus 2` | `bed [X]` | `a resus bay` |
| `Rivermouth District Hospital` | `[HOSPITAL]` | `a regional private hospital` |
| `works as the local fire captain` | `works as a [OCCUPATION]` | drop the occupation unless it is clinically load-bearing |
| `at 1400 the AIN came and got me` | `at [TIME]` | `two hours into the shift` — keep the interval, lose the clock |

The rule underneath: **the clinical fact stays, the coordinate goes.** Time
of day, date, place, bed and name are coordinates. Rhythm, dose, lactate,
sequence and outcome are the case.

## Where an occupation is load-bearing

Sometimes it is: the presentation is occupational, or the exposure explains
the pathology. Keep it at the lowest resolution that preserves the medicine —
"worked with silica dust", not "worked at the Rivermouth quarry"; "a
first-responder", not "the local fire captain". If dropping it entirely
leaves the case intact, drop it entirely.

## Sequence

1. **Scan.** `npm run lab:scan -- lab/cases/<case>/raw.md`. Mechanical only.
2. **Resolve every BLOCK.** Generalise per the table. Never leave a
   placeholder that hints at what was removed — `[SURNAME]` tells a reader
   there was a surname worth removing.
3. **Decide every FLAG, in writing.** Each flag gets a line in
   `deid-log.md`: what it was, what you did, why. "Kept — occupation is the
   exposure" is a decision. Silence is not.
4. **Read the whole case for mosaic risk.** Ask the standard above out loud.
   Rare presentation plus small named facility is the pattern to hunt.
5. **Re-scan.** Exit code 0 with the log complete.
6. **Sign-off is a human act.** You set `deidentified: false` and list what
   you did. Brad sets it true. You never set it true yourself.

## Conservatism, concretely

When you cannot decide whether a detail identifies:

- **Do not remove it silently.** Removing without a record is how a case
  quietly loses the finding that made it worth writing.
- **Do not keep it silently.** That is the failure that matters.
- Flag it, state the risk in one sentence, propose the generalisation you
  would make, and let the reviewer choose.

Over-flagging costs a reviewer ten seconds. Under-flagging publishes a
patient. These are not comparable errors and you should not try to balance
them.

## The contributor is not the patient

Contributor names, roles and units are **credited deliberately** — that is
the whole model. The scanner will flag the byline as a capitalised name pair;
that flag is resolved "contributor, credited with consent", not removed.

The exception: where the contributor's own identity plus a named unit plus a
rare case identifies the *patient*, the mosaic rule wins. Credit the
contributor at unit level and drop the rarity, or seek consent.

## What never appears, in any form

Patient name, initials or nickname; URN, MRN, IHI, NHI, Medicare or health
fund number; date of birth; any calendar date; phone number, email or
address; vehicle registration; named treating clinician; specific bed, room,
bay or theatre; the name of the funeral director, the coroner's file, or any
external agency that identifies the event.

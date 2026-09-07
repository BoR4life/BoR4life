# The Lab — working files

Production files for The Lab, the peer-led clinical education program for
nurses. The agent that works in here is the `the-lab` skill
(`.claude/skills/the-lab/`) plus the commands in `.claude/commands/lab/`.

## This repository is public

Real case material never lands in git. `lab/cases/`, `lab/contributors/`,
`lab/issues/`, `lab/questions/` and `lab/metrics/` are all gitignored, and
they should stay that way even after the cases are de-identified.

The reason is that de-identified and publishable are different standards. A
case can be anonymous to a stranger and completely obvious to the ward that
treated the patient — same season, same unit, same unusual presentation.
GitHub's default branch is what a visitor to the repository sees, so the
working library lives on Brad's machine and only the scaffolding is tracked.

Site names are business-sensitive for the same reason. Anything committed
refers to sites by descriptor, not by facility name. The roster lives in an
untracked local file alongside `docs/constraints.local.md`.

## What is tracked

| Path | What it is |
| --- | --- |
| `lab/templates/` | Blank case, issue and de-identification log templates |
| `lab/samples/` | Fabricated dirty cases — test fixtures for the scanner |
| `lab/samples/worked-example/` | One case carried end to end, built from a fabricated sample |
| `lab/deid-allowlist.txt` | Clinical terms the scanner should stop flagging as names |

## What is not

| Path | What it holds |
| --- | --- |
| `lab/cases/<case-id>/` | `raw.md`, `scan-raw.txt`, `deid-log.md`, `structured.md`, `contributor.md` |
| `lab/contributors/` | The contributor register |
| `lab/issues/<n>-<month>/` | Assembled issues, held for review |
| `lab/questions/` | The question bank, tagged by strand |
| `lab/metrics/` | Per-issue completion, scores and open rate |
| `lab/deid-allowlist.local.txt` | Site and locality names for the allowlist — untracked, because they are business-sensitive |

## The scanner

```bash
npm run lab:scan -- lab/cases/2026-10-rhythm-01/raw.md
```

Deterministic identifier detection. Exit code 1 if anything is BLOCK. It is
tuned to over-flag, because a false positive costs ten seconds and a false
negative publishes a patient.

**It is half the job.** It finds patterns; it cannot ask whether a colleague
on that unit would recognise the patient. A clean scan is never sign-off.

`tests/lab-deidentification.spec.ts` runs it against the fabricated samples
and fails if any of the known identifiers stops being caught.

## The order of work

```
/lab:intake           raw submission in, consent captured, scanned on arrival
/lab:deidentify       blocks resolved, flags decided in writing, mapped to template
/lab:draft-questions  decision questions, model answers, self-audited
/lab:find-evidence    2–3 papers, citations verified against PubMed
/lab:assemble-issue   the issue, held for two-person clinical review
```

Nothing sends. The pipeline ends at a file marked DRAFT.

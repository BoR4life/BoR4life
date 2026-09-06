# Question design

The test a question has to pass: **could a nurse who has never seen this
condition answer it correctly by recognising a word?** If yes, it is a recall
question and it does not go in.

## Recall versus decision

Recall asks what is true. Decision asks what you do, when you are the one
standing there, with what you have.

> **Recall.** Which arrhythmia is characterised by an irregularly irregular
> narrow-complex rhythm with absent P waves?
> A. Atrial fibrillation ✓

Every nurse who has ever seen a flashcard answers that. It measures nothing.

> **Decision.** A 68-year-old woman is in AF at 168 with a BP of 88/54 and is
> pale and clammy. The registrar asks you to draw up metoprolol 2.5 mg IV.
> What do you do?
> A. Draw it up and give it — rate control treats the cause
> B. Draw it up, and say the blood pressure makes rate control the wrong
>    first move; ask whether we are cardioverting ✓
> C. Refuse and call a MET
> D. Give it at half the dose to protect the blood pressure

The distractors are all things that happen on real wards. B is right because
instability changes the algorithm, not because the others are absurd.

## Construction rules

- **Stem carries the situation**, not the answer. Enough observations,
  investigations and context to decide; nothing that gives it away.
- **The nurse is the actor.** "What do you do", "what do you say", "what do
  you escalate", "what do you check first" — not "what is the diagnosis".
- **Distractors are defensible.** Every wrong option should be something a
  competent nurse might genuinely do. An obviously silly option turns a
  four-option question into a three-option one.
- **One clearly best answer.** If two are defensible, the question is
  broken — rewrite it, do not adjudicate it in the answer.
- **No absolutes as a tell.** "Always", "never" and "all of the above" are
  answer-shaped and experienced test-takers read them, not the medicine.
- **Four options.** Consistent across the issue.
- **Never test a fact the case does not contain.** If the case does not say
  what the potassium was, no question turns on the potassium.

## Model answers

Every question carries a model answer with reasoning, written for the nurse
who got it wrong. Three parts:

1. **Why the right answer is right** — the mechanism or the principle, one
   short paragraph.
2. **Why the most attractive wrong answer is wrong** — name it. The
   distractor people pick is where the learning is.
3. **What to do with it on shift** — one sentence, concrete.

No citation is required for a model answer that reasons from the case. Any
claim about outcomes, incidence or effect size needs a citation, per the
standing rule.

## The four strands

Draft only for the strands the case actually contains. A case with no imaging
gets no imaging question — a manufactured one teaches the wrong thing about
what was available.

- **Rhythm** — ECG interpretation driving a management decision: rate versus
  rhythm, stability, when the algorithm changes.
- **Imaging** — what the film shows, what was missed, satisfaction of search,
  what you ask for next and why.
- **Assessment** — A to E, escalation, deterioration recognised before it is
  measurable, when to call and what to say.
- **Pathology** — what the number means in this patient, trend versus
  snapshot, what to do about it now.

Four to six questions per issue is the working range. Fewer if the case only
honestly supports fewer.

## Difficulty

Aim at the nurse two years in, on a night shift, without a registrar in the
room. Not the novice — the questions should be answerable but not free. Not
the specialist — this is not a credentialing exam.

## The bank

Questions go to `lab/questions/` tagged by strand, case, and the decision
they test, so an issue can draw on prior material and so repeats are visible.
Reusing a question is fine; reusing it without noticing is not.

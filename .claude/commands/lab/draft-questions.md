---
description: Draft quiz questions from a structured case — decision questions only, with model answers and reasoning.
argument-hint: "[case ID]"
allowed-tools: Read, Write, Edit, Glob, Grep
---

Load the `the-lab` skill, then read `references/questions.md`.

Draft questions for: $ARGUMENTS

## The test every question must pass

**Could a nurse who has never seen this condition answer it correctly by
recognising a word?** If yes, it is recall and it does not go in.

The nurse is the actor. "What do you do", "what do you say", "what do you
escalate", "what do you check first" — never "what is the diagnosis".

## Steps

1. **Read `structured.md`.** Work only from the de-identified structured
   case. If sign-off is still false, that is fine — questions can be drafted
   in parallel — but say so in your report.

2. **Identify which strands the case actually contains**: rhythm, imaging,
   assessment, pathology. Draft only for those. A case with no imaging gets
   no imaging question; manufacturing one teaches the wrong thing about what
   was available.

3. **Draft four to six questions.** Fewer if the case only honestly supports
   fewer. Four options each, one clearly best answer, distractors that a
   competent nurse might genuinely choose. No absolutes, no "all of the
   above".

4. **Never test a fact the case does not contain.** If the case does not say
   what the potassium was, no question turns on the potassium.

5. **Write a model answer for each**, in three parts: why the right answer is
   right; why the most attractive wrong answer is wrong, named explicitly;
   what to do with it on shift, in one sentence.

6. **Audit your own draft before reporting.** For each question, state in one
   line why it is a decision and not recall. Any question where you cannot
   make that case, rewrite or cut. Report the audit — it is the check that
   matters, and a silent pass is worthless.

7. **Write to `lab/questions/<case-id>.md`** tagged by strand and by the
   decision each question tests, so repeats across issues are visible.

## Report

The questions, the self-audit, which strands you covered and which you left
alone and why, and any question you cut.

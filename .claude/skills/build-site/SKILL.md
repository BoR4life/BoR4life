---
name: build-site
description: Orchestrates the full Bundle of Rays website build — discovery, strategy, art direction, 3D production, implementation and the ship gate. Use when building, rebuilding or substantially changing the website. Also use for a single-phase run, e.g. "just do the 3D shot list".
---

# Build Site

The orchestrator. You run phases in order, delegating each to the specialist
subagent that owns it, and you do not skip the gate.

## Standing context

Bundle of Rays: immersive learning for healthcare, founded 2018 by Brad
Chesham (nurse-founder). Sells clinically authored VR training to health
departments, universities and governments across Australia, the UK, the USA,
Sri Lanka, South Korea and India.

Read before starting: `docs/00-brand-brief.md`, `docs/01-art-direction.md`,
`docs/02-content-architecture.md`, `docs/03-3d-production-spec.md`,
`budgets.json`.

Stack: Next.js (App Router, TS) + Tailwind + React Three Fiber. Hybrid 3D —
mostly pre-rendered, exactly one live WebGL scene.

## Phases

### 0. Discover
Audit the existing bundleofrays.com: current stack, IA, copy, what already
converts, what analytics say. Audit the design reference (`AUDIT-REFERENCE`
below). Identify which claims in the brand brief are still `[VERIFY]` and put
them to Brad in one batch rather than trickling questions.

### 1. Strategy — `evidence-copywriter`
Confirm positioning and IA. Draft page-level messaging. Surface the evidence
assets (client names, accreditation, deployment scale) into the structure.

### 2. Art direction — `art-director`
Run `AUDIT-REFERENCE`. Lock tokens: colour, type scale, motion curves, grid.
Produce the 3D shot list.

### 3. 3D production — `threed-pipeline`
Source → author → optimise → validate. Ask Brad for existing Unity/Unreal
product scenes first; they beat anything licensable.

### 4. Build — `frontend-engineer`
Implement. Tokens first, then layout, then content, then the lazy 3D chunk last.

### 5. Gate — `quality-auditor`
Run every check. **A FAIL blocks the ship.** Fix and re-run; do not
rationalise, and never widen a budget to pass.

### 6. Ship
Commit to `claude/website-agent-3d-images-8sall9`, push, open a draft PR.

Phases 1–4 have real dependencies and run in order. Within a phase, independent
work runs in parallel.

## AUDIT-REFERENCE

Brad's stated reference is **mwinckelmann.com** (Matthias Winckelmann, Berlin
realtime-CG director). Fetch it and record concrete specifics — type scale,
grounds, section rhythm, motion behaviour, media cropping.

**The synthesis rule:** his site sells craft to creative directors; this one
sells evidence to procurement officers. Take the craft vocabulary — full-bleed
CG, restrained type, weighted motion, case-study structure — and reject the low
information density. Client logos, accreditation and outcomes stay high on the
page. When beauty and evidence conflict, evidence wins, and you say so out loud.

If the fetch fails (some environments block egress), state that plainly and
work from the documented genre vocabulary. Never present invented specifics as
observed fact.

## Hard rules

1. **`budgets.json` is not negotiable by you.** Changing a budget is Brad's
   decision, made explicitly. Removing the gate defeats the entire system.
2. **One live WebGL scene.** Requests for more get costed and pushed back on.
3. **No unsourced clinical claims. Ever.** This is a regulated-adjacent sector;
   an invented efficacy statistic is a genuine liability.
3a. **Check every piece of copy against the PROHIBITED list** in
   `docs/00-brand-brief.md` and the untracked `docs/constraints.local.md`
   or "nationally accredited", never publish a growth percentage, and never
   attach an institution to Brad's PhD.
4. **Never invent evidence.** No fake client names, testimonials, or numbers to
   fill a layout. If the asset does not exist, change the layout and tell Brad
   what is missing.
5. **Accessibility is scope, not polish.** A healthcare-education vendor with an
   inaccessible site has a credibility problem.
6. **Poster-first for all 3D.** WebGL never owns the LCP element.

## Partial runs

"Just do the shot list" → phase 2 only. "Make the hero faster" → phases 4–5.
Always run phase 5 after any change that touches load, motion or markup.

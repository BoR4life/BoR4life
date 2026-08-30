# The Scroll Narrative — decision record

Brad's proposal: *"This company is building the new frontier. The background 3D
environment could be a landscape, and as people scroll the landscape evolves."*

This document works that idea through, because it is the single biggest
structural decision on the site and it cuts across the performance and
accessibility rules in `budgets.json`.

**Verdict: adopt the idea, change the mechanism.**

---

## Why the instinct is right

**1. One world beats eight disconnected 3D moments.**
The shot list in `docs/02-content-architecture.md` currently has a hero, three
pillar loops, a deployments still and per-case-study loops. That is six or seven
separate 3D "looks" with no relationship to each other. It is more expensive to
produce, harder to keep visually consistent, and reads as decoration.

A single evolving world is cheaper, more coherent, and turns the 3D from
decoration into structure.

**2. "Frontier" is not a metaphor here — it is the company timeline.**
A nurse working in Australia, the UK, Afghanistan and Iraq. A company started in
Buderim. Five years running with Queensland Health. Ohio State. Repeat work in
South Korea. Live in Pune. State-level programs on the horizon. The journey is
literally true, which is rare — most companies reaching for a journey metaphor
have to invent one.

**3. It is memorable.** Procurement readers evaluate a lot of vendors. Almost
none of them are remembered.

---

## Why the literal version would hurt this specific company

### 1. Vestibular safety — the disqualifying one

`docs/03-3d-production-spec.md` sets a hard rule: **no involuntary camera motion
on scroll.** A scroll-scrubbed camera flight through a landscape is the textbook
trigger for motion-induced nausea, and it is not a rare complaint —
scroll-driven parallax and camera movement are among the most common causes of
reported discomfort on the web.

For most companies this is a WCAG problem. For this one it is worse:

- The audience is **nurses and clinical educators**. They understand vestibular
  dysfunction professionally. They will not experience a queasy website as a
  design choice; they will recognise it as a known accessibility failure.
- The product's own credibility rests on **safe, well-designed immersive
  experience**. A company selling VR that does not induce simulator sickness
  cannot ship a *website* that does. It undercuts the core product claim.

`prefers-reduced-motion` mitigates this, but only for the minority who have set
it. Most affected users have not.

### 2. It inverts the performance architecture

A persistent scroll-driven scene means WebGL is mounted on every route, for the
whole session, competing with the main thread continuously. The gate exists
because the buyer who matters most — a procurement officer on a locked-down
hospital laptop — is exactly the visitor a persistent WebGL context punishes.

### 3. An abstract landscape dilutes the actual moat

Sublime terrain, drifting fog, glowing particles: this is the house style of
every AI, crypto and developer-tools company of the last five years. It signals
"technology company" generically.

Bundle of Rays' differentiation is the opposite of generic — **clinician-led,
clinically specific, five years deep with a health department**. Trading
clinical specificity for abstract frontier imagery spends the one asset
competitors cannot copy in order to look like everyone else.

---

## The synthesis: "The frontier becomes the ward"

Keep the evolving world. Make what it evolves *into* the point.

```
  SCROLL ──────────────────────────────────────────────────────────►

  1. TERRAIN        2. STRUCTURE      3. ENCLOSURE     4. THE BAY
  Raw, wide,        Frame and         Walls, light,    Fully realised
  unbuilt.          scaffold rise     surfaces form    resus bay.
  "The frontier."   from the terrain. around you.      Look around.
                                                        ▲
                                       the one live WebGL moment
```

The landscape does not merely change — it **resolves into clinical reality**.
The visitor arrives, by scrolling, inside the bay that already exists in
`scripts/build_clinical_bay.py`.

This wins on every axis that was in tension:

| | Abstract landscape | Frontier → ward |
|---|---|---|
| Frontier feeling | Yes | Yes |
| Clinical specificity | Lost | Is the payoff |
| Reusable work | New assets | Reuses the bay |
| Says what the company does | No | Literally |

### Mechanism: cross-faded states, not a scrubbed camera

**The camera never moves with the scroll.** Instead, 6–8 pre-rendered 4K states
cross-fade as scroll position advances. The world changes; the viewpoint does
not.

This is how most acclaimed "scroll journeys" are actually built — as image
sequences, not live WebGL. It buys:

- **No vestibular risk.** Nothing flies, tilts or lurches. Cross-fade is not
  vection.
- **Better images.** Offline path tracing beats anything realtime can do at
  this budget.
- **Graceful everywhere.** No WebGL, no JavaScript, slow network or reduced
  motion → the states simply snap instead of fading. Nothing breaks.
- **A known cost.** ~8 × 250KB AVIF ≈ 2MB, loaded progressively, versus a
  permanently mounted WebGL context.
- **The live scene stays exactly one** — the final bay — preserving the rule in
  `docs/03-3d-production-spec.md`.

### Accessibility rules for it

- `prefers-reduced-motion: reduce` → states snap, no cross-fade, no parallax.
- Every state carries its own alt text; the narrative is legible to a screen
  reader as a sequence of described scenes.
- **All copy is in normal document flow**, never revealed by scroll position.
  Content parity is absolute: the sequence is atmosphere, never the carrier of
  information.
- The page must be fully readable with the whole sequence disabled.

---

## Open question for Brad

The narrative spine can be **conceptual** or **geographic**:

- **Conceptual** (recommended): terrain → structure → enclosure → bay.
  Universal, safe, and lands on clinical specificity.
- **Geographic**: the real deployment journey — Buderim, Queensland, Ohio,
  Pune. More personal and more true, but it raises a question about how to
  handle the Afghanistan and Iraq chapter of the founder story. That is
  powerful material and also easy to get wrong; it needs Brad's judgement, not
  an agent's.

Recommendation: build the conceptual version, and hold the geographic one for
the `/about` page where the founder story has room to be told properly.

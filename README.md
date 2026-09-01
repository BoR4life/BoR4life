# Bundle of Rays — Web Studio Agent

An agent system that builds and maintains the Bundle of Rays website: a
type-led, evidence-first site for a healthcare immersive-learning company,
held to machine-enforced performance, accessibility and security budgets.

## Why it is built this way

Two ideas do the work here.

**1. "World class" has to be measurable, or it decays.** Prompting an agent to
"make it world class" produces something that looks good the week it ships and
degrades on every commit after. So the quality bar lives in `budgets.json` and
is enforced by a validator that exits non-zero. The agent cannot talk its way
past the gate, and is explicitly forbidden from widening it.

**2. Beautiful and effective are not the same goal here.** Bundle of Rays sells
to Queensland Health (five years and counting), Ohio State, and institutions
across India and South Korea. Those readers want evidence, accreditation and outcomes — fast, on a
locked-down laptop. The art direction is typographic and restrained, built
around the few real assets the company has — recorded scenario footage, a
partner's de-escalation roleplay, one photograph of a session — rather than
around renders that stand in for them. Where craft and evidence conflict,
evidence wins, and the agent is instructed to say so out loud rather than
quietly compromise.

## Using it

```
/build-site                     full run: discover → strategy → art direction
                                → 3D → build → gate → ship
/build-site just the shot list  single phase
/3d-asset-pipeline              anything involving 3D assets
/ship-check                     the pre-deploy gate
```

Specialist subagents in `.claude/agents/`: `art-director`, `threed-pipeline`,
`frontend-engineer`, `evidence-copywriter`, `quality-auditor`.

## Where the 3D went

The first build opened with a three-stage scroll narrative and a live WebGL
resuscitation bay. It was removed in September 2026: the founder looked at
it and said it had not hit the spot, and the agent's own review agreed —
the opening frame was the weakest image on the site and the one every
visitor saw first. Meanwhile the site had one environment shown nine times
while the copy promised several.

What replaced it is cheaper and more honest: a statement, real footage, and
the client list inside the first viewport. The whole 3D pipeline — Blender
scene scripts, glTF optimisation, budget validation, the poster-first
runtime pattern — stays in the repo, parked, for when 3D or 360° video comes
back with the photography and the second environment to justify it. See
`docs/03-3d-production-spec.md` (parked) and `docs/09-go-live.md`.

Two things learned in that build are worth more than the scene was, and
are written down in `docs/08-security.md`: Draco and KTX2 decoders cannot
run under a strict CSP, and every failure mode of a lazy 3D scene looks
exactly like a working page.

## Analytics

Two layers, both privacy-first (`docs/10-analytics.md`): every enquiry
email says where the lead came from — referrer, campaign tag, landing page,
country — with no vendor involved; and PostHog, off until keyed, for
aggregate traffic and returning visitors.

## The asset pipeline (parked)

```bash
./scripts/optimize-gltf.sh source.glb public/models/hero-ward.glb hero
node scripts/validate-assets.mjs      # exits 1 on any breach
```

The validator checks file size, triangle count, draw calls, required Draco and
KTX2 compression, forbidden source formats, missing poster frames and
unregistered licences.

## Layout

```
budgets.json                   the quality bar — single source of truth
.claude/agents/                five specialist subagents
.claude/skills/                build-site, 3d-asset-pipeline, ship-check
  3d-asset-pipeline/references/  poster-first R3F reference implementation
docs/00-brand-brief.md         positioning, buyers, evidence assets
docs/01-art-direction.md       tokens, type, motion — and the reference caveat
docs/02-content-architecture.md sitemap + 3D shot list
docs/03-3d-production-spec.md  the full pipeline
docs/04-performance-budgets.md why each number is what it is
docs/asset-licences.md         licence registry (procurement will ask)
scripts/validate-assets.mjs    the gate
scripts/optimize-gltf.sh       Draco + KTX2 optimisation
```

## Before the first real run

Two things need Brad:

1. **Verify the `[VERIFY]` claims** in `docs/00-brand-brief.md` — client names,
   Client facts are now **confirmed** (Queensland Health 5yrs, Ohio State via
   the Brad Innovation Fellowship, TSU, DY Patil Pune). Note the **PROHIBITED**
   list in that doc — ACU (critical NDA), Aspen Medical, growth percentages,
   and any institution attached to Brad's PhD. Agents check copy against it.
2. **Point the pipeline at existing Unity/Unreal product scenes.** They are the
   best 3D source available — authentic, differentiated, zero licence risk —
   and better than anything that can be bought.

## Stack

Next.js (App Router, TypeScript) · Tailwind · React Three Fiber ·
gltf-transform (Draco + KTX2) · Lighthouse CI + axe-core at the gate.

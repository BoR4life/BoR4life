# 2026 Design Trends — filtered against this brand

Brad shared four sources: a "Top 15" agency roundup, and three 2026 trend
reports (elcom, Figma, plus the earlier discussion). This document runs each
trend through one filter — **does it serve an evidence-led healthcare buyer,
or does it serve a portfolio award** — and records the verdict, so the
agents don't relitigate this every time a trend piece lands.

Sources: [elcom, "Website Design Trends 2026"](https://www.elcom.com.au/resources/blog/website-design-trends-in-2026);
[Figma, "Top Web Design Trends for 2026"](https://www.figma.com/resource-library/web-design-trends/);
the "Top 15 Website Design Inspirations for 2026" agency roundup (Wavespace).

## The one case study that actually matches this brief

Of the 15 examples in the agency roundup, **Phamily Pharma** is the one worth
studying closely — it is the only one solving the same problem Bundle of Rays
has: a technical healthcare product with two very different audiences (B2B
supply-chain buyers and B2C patients), needing warmth without losing rigor.
Its reported techniques — sticky narrative cards that carry a complex process
across the scroll, illustration used to soften clinical subject matter,
founding-story sections that build trust — map directly onto our own
"clinician-led" positioning and the case-study structure already specified in
`docs/02-content-architecture.md`. Worth a proper look if the live site
becomes fetchable from a future environment.

Two other patterns from that roundup are directly applicable and already
partially adopted:

- **Wavespace's cycling hero messaging** (the headline rewrites itself per
  visitor segment — startup, AI/ML, SaaS) is the mechanism our three-buyer
  problem (`docs/00-brand-brief.md` — institutional procurement, academic
  decision-makers, clinical educators) has been missing a concrete answer
  for. Adopt: a hero subhead that cycles between "for health departments,"
  "for universities," "for clinical educators" — same headline, targeted
  proof point underneath.
- **Noomo's "accessible innovation"** — 3D/AI shown as live capability with
  lightweight fallbacks for slower devices — is exactly the poster-first,
  capability-gated pattern already built in
  `.claude/skills/3d-asset-pipeline/references/r3f-patterns.tsx`. No change
  needed; good external confirmation the approach is right, not a niche one.
- **Lusion's "lessons in limits"** (GPU effects with real fallbacks, credited
  as *responsible* innovation rather than a compromise) is the same argument
  already made for one live WebGL scene in `docs/03-3d-production-spec.md`.
  Also confirmation, not new direction.

## Trend-by-trend verdict

| Trend | Verdict | Why |
|---|---|---|
| **Bold/saturated "dopamine" colour palettes** | **Reject** | Named by Figma as fueled by Y2K nostalgia and aimed at lifestyle/beauty/youth brands. Directly contradicts the near-monochrome shell + single clinical accent locked in `docs/01-art-direction.md` §Colour. A saturated palette on a health-department procurement site reads as consumer, not clinical — the opposite of the credibility this site needs to project. |
| **Glassmorphism** | **Reject** | Decorative chrome effect with no informational job. `docs/01-art-direction.md` already rules "CG carries the page, UI gets out of the way" — frosted-glass panels are UI asking to be looked at, which is backwards here. |
| **Kinetic type as spectacle** (type that moves for its own sake) | **Reject as primary; keep as accent** | Already have "type discipline... two extremes, almost nothing in between" — that's a *quiet* system. Motion on type is fine for the odd number counting up in the evidence section (a "5 years" that resolves in), never for headlines that shake or morph, which reads as attention-seeking on a life-and-death subject. |
| **Bento grids** | **Conditional accept** | Legitimate for the evidence/outcomes section — a bento layout is a good container for heterogeneous proof points (a client logo, a number, a quote, a date) without forcing them into uniform cards. Not for the whole site. |
| **AI personalisation** (content adapts to visitor) | **Accept, narrow scope** | The cycling-hero-by-segment idea above is a bounded, useful version of this. Full behavioural personalisation is out of scope and a data-handling question this project hasn't opened. |
| **Expressive/oversized typography** | **Already adopted** | `clamp(2.5rem, 6vw, 7rem)` display type is already in the spec. Compatible with "expressive," not with "many weights/styles" — we stay at two weights, per the existing system. |
| **3D/interactive product experiences** | **Already adopted, more conservatively** | Figma cites Nike/IKEA using 3D+AR for pre-purchase visualisation — same logic as our one live WebGL bay: let the visitor experience the product category before committing. Our version is more restrained (one scene, not "sites featuring interactive models" plural) for the reasons in `docs/03-3d-production-spec.md`. |
| **Dark mode as default** | **Partially adopted** | The frontier/hero sequence is dark by design (the ray needs darkness to crest into). But `docs/01-art-direction.md` specifies light *and* dark sections deliberately — an all-dark site would flatten the day/night contrast the whole scroll narrative depends on. |
| **Micro-interactions / inclusive design / performance-first** | **Already the spine of the whole project** | These aren't trends to layer on — `budgets.json`, the accessibility rules, and the motion-reduction handling already make this the foundation, not a feature. |

## The standing rule this document exists to protect

Every trend list samples from the same pool: portfolio sites, D2C brands, and
consumer apps optimising for *delight as the conversion mechanism*. This
site's conversion mechanism is *credibility* — a health department or
university deciding whether to trust a vendor with a training program that
touches patient safety. Delight earns the right to be evaluated; it does not
replace the evaluation. Any trend that increases visual noise, saturation, or
motion for its own sake trades against that, regardless of how current it is.

When a future trend piece arrives, run it through this same table before
changing anything in `docs/01-art-direction.md`.

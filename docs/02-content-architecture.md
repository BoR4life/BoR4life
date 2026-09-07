# Content Architecture

Structured for the procurement reader first, the browser second. Each section
names its **3D slot** so the shot list falls straight out of the sitemap.

## Sitemap

```
/                        Home
/platform                What the platform is — XR + AI roleplay + analytics
/solutions/nursing       VR for nursing education
/solutions/patient       Patient education
/solutions/custom        Custom content development
/evidence                Outcomes, research, methodology      ← the tender-winner
/case-studies            Index
/case-studies/[slug]     Deployment stories
/about                   Founder story, clinical team
/resources               Procurement entry point — published + answered-on-request
/privacy                 Privacy notice, written from the implementation
/accessibility           WCAG 2.2 AA conformance statement
/contact                 Book a demo
```

`/evidence` and the procurement pack under `/resources` are the two pages that
close institutional deals, and are the two most commonly missing from
immersive-tech sites. Build them first, not last.

**How `/resources` was actually built, and why it is not what the brief above
implies.** The obvious version — a downloadable "security pack" and a grid of
compliance badges — could not be built honestly, because every badge would be
a claim we cannot substantiate. In health-sector procurement an unsupported
certification claim is not weak marketing; it ends the deal at the point it is
checked, and it *is* checked. So the page inverts the structure: it publishes
what is genuinely published (`/evidence`, `/privacy`, `/accessibility`,
`/solutions` — all backed by real implementation), and for everything else it
names the question, says plainly that the answer comes from a person, and
routes to the enquiry form. This is the same argument `/evidence` makes about
efficacy statistics, applied to compliance. Whitepapers belong here once they
exist; nothing goes on the page before it does.

## Home page

| # | Section | Purpose | 3D slot |
|---|---|---|---|
| 1 | Hero | Positioning in one line + demo CTA | **LIVE WebGL** — the one interactive scene. Clinical environment, look-around. Poster-first. |
| 2 | Credibility bar | Client logos + accreditation, above fold on desktop | none |
| 3 | The problem | Training gap, stated clinically | Still — abstract, restrained |
| 4 | Platform | XR + AI roleplay + analytics, three cards | 3× loop (4s, muted) — one per pillar |
| 5 | Evidence | 3 headline numbers, link to `/evidence` | none — data is the visual |
| 6 | Deployments | Map/list: AU, UK, USA, Sri Lanka, South Korea, India | Still — stylised globe or none |
| 7 | Case study feature | One deep story | Loop, full-bleed |
| 8 | Founder note | Brad, nurse-founder, doctoral researcher — the differentiator. **Never name the PhD institution.** | Photograph, not 3D |
| 9 | CTA | Book a demo | none |

**Rule: sections 1 and 2 must both be reachable without scrolling on a 1440×900
desktop.** The cinematic hero cannot push the client list below the fold.

## Case study template

Hero loop → Context (setting, cohort, constraint) → Approach → **Outcomes block**
(cohort size, measure, result, source — hard numbers, cited) → Quote → Next.

The outcomes block is mandatory. A case study without one is a brochure.

## 3D shot list (derived from above)

| ID | Type | Subject | Budget ref |
|---|---|---|---|
| `hero-ward` | LIVE glTF | Clinical environment, look-around | `models.hero*` |
| `hero-ward-poster` | Still | Frame 0 of above, LCP image | `prerenderedStills` |
| `frontier-s1` | Still | State 1 — first ray crests the ridge (`build_frontier_state1.py`) | `prerenderedStills` |
| `frontier-s2..s3` | Stills | Light through rising structure | `prerenderedStills` |
| `pillar-xr` | Loop 4s | Headset POV / environment | `prerenderedVideo` |
| `pillar-ai` | Loop 4s | Roleplay conversation abstraction | `prerenderedVideo` |
| `pillar-analytics` | Loop 4s | Data surfacing from a scene | `prerenderedVideo` |
| `deployments` | Still | Stylised globe | `prerenderedStills` |
| `case-[slug]` | Loop 6s | Per case study | `prerenderedVideo` |

Total live WebGL scenes: **1**. Everything else is baked.

## Copy rules

- Every claim carries a source or a `[VERIFY]` tag until Brad confirms it.
- Numbers beat adjectives — but **no growth percentages** (see the PROHIBITED
  list in the brand brief). The publishable number is "five years with
  Queensland Health". Duration and repeat business outperform a growth rate
  with procurement readers anyway: they buy continuity, not momentum.
- Never claim clinical outcomes without a citation. In this sector an
  unsourced efficacy claim is a regulatory and reputational risk, not just
  weak copy.

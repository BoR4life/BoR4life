import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Main } from '@/components/site/Main';
import { Cta } from '@/components/site/Cta';

export const metadata: Metadata = pageMetadata({
  title: 'Evidence',
  description:
    'How Bundle of Rays measures learning: clinical decisions, communication and procedural accuracy, captured during the scenario rather than after it.',
  path: '/evidence',
});

/**
 * The tender-winner page.
 *
 * docs/02-content-architecture.md flags this as the page that closes
 * institutional deals and the one most commonly missing from
 * immersive-tech sites. It is deliberately the least decorated page here —
 * a procurement reader wants to find things, not be impressed.
 *
 * IMPORTANT: every claim on this page is either a description of what the
 * platform measures, or a named client relationship Brad has confirmed as
 * publicly nameable. There are NO efficacy statistics, because none have
 * been supplied with a citation — and in this sector an unsourced outcome
 * claim is a regulatory and reputational risk, not just weak copy
 * (docs/00-brand-brief.md, PROHIBITED list).
 *
 * The one third-party statement on this page is quoted from a public
 * document and carries its citation inline. Deliberately NOT used: a
 * separate quote from a named staff member in the same article. She was
 * describing her own service's reasons for adopting VR and did not mention
 * Bundle of Rays at all — running it beside our name would let a reader
 * infer an endorsement she never gave, which is exactly the claim a
 * procurement reader checks. If a real endorsement is wanted, ask her for
 * one.
 */

const DEPLOYMENTS = [
  {
    client: 'Queensland Health',
    detail: 'Longest-running customer — five years and continuing.',
    note: 'Continuous renewal over five years is the credibility signal a competitor cannot fabricate.',
  },
  {
    client: 'Ohio State University',
    detail: 'Two projects; the founder is an Innovation Fellow there.',
    note: 'Third-party validation of the founder, not only the product.',
  },
  {
    client: 'Taegu Science University',
    detail: 'Repeat engagements, South Korea.',
    note: 'Institutions that come back are the strongest form of reference.',
  },
  {
    client: 'DY Patil, Pune',
    detail: 'A customer two years in a row, India.',
    note: 'A renewal is the reference that matters — the second year is the one that was chosen with full knowledge.',
  },
];

const MEASURES = [
  {
    title: 'Clinical decisions',
    body: 'Which action the learner took, at which point in the deteriorating scenario, and what they chose not to do. Captured as it happens, not reconstructed afterwards from memory.',
  },
  {
    title: 'Communication',
    body: 'What was said, to whom, and when — including escalation. AI-driven roleplay adapts to the learner’s responses, so the conversation is assessed rather than scripted.',
  },
  {
    title: 'Procedural accuracy',
    body: 'Sequence, technique and omissions against the expected clinical pathway, recorded per attempt so improvement across repetitions is visible.',
  },
];

export default function EvidencePage() {
  return (
    <Main>
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-300">
            Evidence
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
            Training you can put in front of a review committee.
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            Immersive learning is only worth funding if it changes what
            practitioners do. Every scenario captures decision, communication
            and procedural data as the learner works, so the effect is
            measurable at the individual and the cohort level.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="measures-heading"
        className="border-t border-ink-700 px-6 py-20 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="measures-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-300"
          >
            What is measured
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {MEASURES.map((m) => (
              <div key={m.title}>
                <h3 className="text-xl font-semibold text-paper-0">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-300">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="deployments-heading"
        className="border-t border-ink-700 bg-paper-100 px-6 py-20 text-ink-900 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="deployments-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-500"
          >
            Where it is deployed
          </h2>
          <ul className="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            {DEPLOYMENTS.map((d) => (
              <li key={d.client} className="grid gap-2 py-6 md:grid-cols-3">
                <p className="text-lg font-semibold">{d.client}</p>
                <p className="text-sm text-ink-500">{d.detail}</p>
                <p className="text-sm text-ink-500">{d.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="published-heading"
        className="border-t border-ink-700 px-6 py-20 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="published-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-300"
          >
            Said about us, in public, by a health service
          </h2>
          <figure className="mt-10 max-w-prose">
            {/* hanging-quote pulls the opening quote mark into the margin.
                Set inline it pushes the first line visibly right of the
                block's left edge, so the quote reads as misaligned with
                everything above it — the kind of detail nobody names and
                everybody notices. See app/globals.css. */}
            <blockquote className="hanging-quote border-l-2 border-signal pl-7 text-[clamp(1.375rem,2.1vw,1.75rem)] leading-[1.3] tracking-[-0.02em] text-paper-0">
              <p>
                &ldquo;Working in partnership with immersive technology experts
                in the field of Nursing, Bundle of Rays, our Learning and
                Development team is also taking their VR understanding to the
                next level&hellip;&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-5 text-sm leading-relaxed text-ink-300">
              South West Hospital and Health Service,{' '}
              <cite className="not-italic">Pulse</cite>, June/July 2021
              edition.
            </figcaption>
          </figure>
          <p className="mt-8 max-w-prose text-sm leading-relaxed text-ink-300">
            This is not a testimonial we asked for. It is a Queensland health
            service describing the partnership in its own staff publication,
            which is why we cite the issue rather than paraphrase it — you can
            ask them.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="approach-heading"
        className="border-t border-ink-700 px-6 py-20 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="approach-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-300"
          >
            Our approach to claims
          </h2>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-paper-100">
            We do not publish efficacy percentages we cannot cite. Where a
            deployment has produced outcome data, we will share the study
            design, the cohort size and the measure alongside the result — so
            you can evaluate it rather than take our word for it.
          </p>
          <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            The platform is clinician-led and grounded in the founder’s
            doctoral research into immersive learning.
          </p>
          <Cta className="mt-10">Request the evidence pack</Cta>
        </div>
      </section>
    </Main>
  );
}

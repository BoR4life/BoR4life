import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Evidence',
  description:
    'How Bundle of Rays measures learning: clinical decisions, communication and procedural accuracy, captured during the scenario rather than after it.',
};

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
    detail: 'Deployed in India.',
    note: 'Expanding from institutional deployments toward state-level programs.',
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
    <main id="main">
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
          <Link
            href="/contact"
            className="mt-10 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
          >
            Request the evidence pack
          </Link>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

import { Section, Eyebrow } from '@/components/site/Section';
import { Main } from '@/components/site/Main';

export const metadata: Metadata = pageMetadata({
  title: 'Resources',
  description:
    'What a procurement or ethics reviewer needs from us: what is published here, and what we will answer directly on request.',
  path: '/resources',
});

/**
 * The procurement page.
 *
 * A deliberate design decision worth defending: this page does NOT present
 * a "security pack" or a "compliance pack" for download. The obvious build
 * — a grid of tiles reading ISO 27001, SOC 2, HIPAA, Essential Eight — is
 * exactly what buyers expect from a vendor site, and every one of those
 * tiles would be a claim we cannot substantiate. In health-sector
 * procurement an unsupported certification claim is not weak marketing; it
 * is a misrepresentation that ends the deal at the point it is checked, and
 * it is checked.
 *
 * So the page inverts the usual structure. It publishes what is genuinely
 * published (privacy, accessibility, evidence — all real pages backed by
 * real implementation), and for everything else it names the question, says
 * plainly that the answer comes from a person, and routes to the enquiry
 * form. The honesty is the differentiator here, not a fallback position:
 * it is the same argument /evidence makes about efficacy statistics.
 *
 * Anything added to PUBLISHED must link to a page that exists and is true.
 * Anything added to ON_REQUEST must be a question Brad can actually answer.
 */

const PUBLISHED = [
  {
    href: '/evidence',
    title: 'What the platform measures',
    body: 'Clinical decisions, communication and procedural accuracy, captured during the scenario rather than recalled afterwards — plus where the platform is deployed and how long those relationships have run.',
  },
  {
    href: '/privacy',
    title: 'Privacy notice',
    body: 'Written from the code: no cookies, no third-party requests, masked analytics, and the exact list of fields the enquiry form collects. Every claim is verifiable from your own browser.',
  },
  {
    href: '/accessibility',
    title: 'Accessibility statement',
    body: 'Our WCAG 2.2 AA conformance claim for this website, the automated and manual testing behind it, and a plain list of the limitations we have not yet closed.',
  },
  {
    href: '/solutions',
    title: 'What we build',
    body: 'The three shapes an engagement takes, and which one fits a nursing school, a health service, or a program that needs something authored from scratch.',
  },
] as const;

const ON_REQUEST = [
  {
    question: 'How is it deployed, and what does it need from our IT team?',
    answer:
      'Headset models, network requirements, whether it runs standalone or tethered, how content is distributed and updated, and what has to be opened on your network.',
  },
  {
    question: 'What data does the platform hold, and where?',
    answer:
      'What learner data a scenario captures, who can see it, how long it is retained, where it is processed, and what happens to it when the engagement ends. If you need in-region processing, ask early — it shapes the architecture, not the paperwork.',
  },
  {
    question: 'How does it integrate with our LMS and identity provider?',
    answer:
      'What we support today, what we have built before for other institutions, and what would need building for yours.',
  },
  {
    question: 'What does support look like after go-live?',
    answer:
      'Response commitments, who provides first-line support, how faults are raised, and how content is updated as clinical guidelines change.',
  },
  {
    question: 'What is the evidence base?',
    answer:
      'The pedagogical basis for how scenarios are authored and assessed, grounded in the founder’s doctoral research. Where a deployment has produced outcome data we will share the study design, cohort size and measure alongside the result — not a percentage without a citation.',
  },
  {
    question: 'Can we run a pilot first?',
    answer:
      'Almost always the right first step. We will scope a cohort, agree what success looks like before it starts, and put the measures in writing.',
  },
  {
    question: 'Supplier onboarding, insurance and contracting documents.',
    answer:
      'Send us your standard supplier pack and we will complete it. We have been through this with health departments and universities across five countries.',
  },
] as const;

export default function ResourcesPage() {
  return (
    <Main>
      <Section ground="paper" size="lg" bordered={false}>
        <Eyebrow>Resources</Eyebrow>
        <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-ink">
          Everything a review committee asks for, in one place.
        </h1>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
          If you are assessing us for a tender, an ethics submission or an IT
          security review, this is the page to start from. Some of it is
          published below. The rest is a short email away, and comes back as a
          direct answer rather than a brochure.
        </p>
      </Section>

      <Section ground="surface" size="md" labelledBy="published-heading">
        <h2
          id="published-heading"
          className="text-xs uppercase tracking-[0.12em] font-label text-muted"
        >
          Published here
        </h2>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg bg-paper/10 sm:grid-cols-2">
          {PUBLISHED.map((item) => (
            <li key={item.href} className="bg-surface">
              <Link
                href={item.href}
                className="group block h-full p-8 transition-colors hover:bg-surface"
              >
                <h3 className="text-lg font-semibold text-ink">
                  {item.title}
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section ground="paper" size="md" labelledBy="request-heading">
        <Eyebrow id="request-heading">Answered on request</Eyebrow>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink">
          These answers depend on which product you are deploying, into which
          institution, under which jurisdiction — so a generic PDF would be
          wrong for almost everyone who downloaded it. Ask, and you will get the
          specifics for your deployment.
        </p>
        <dl className="mt-12 divide-y divide-rule border-y border-rule">
          {ON_REQUEST.map((item) => (
            <div key={item.question} className="grid gap-3 py-7 md:grid-cols-5">
              <dt className="font-semibold text-ink md:col-span-2">
                {item.question}
              </dt>
              <dd className="text-sm leading-relaxed text-muted md:col-span-3">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section ground="surface" size="md" labelledBy="claims-heading">
        <h2
          id="claims-heading"
          className="text-xs uppercase tracking-[0.12em] font-label text-muted"
        >
          What you will not find here
        </h2>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink">
          A wall of certification badges. We publish the standards we have
          actually been assessed against, and nothing else — if a logo is not on
          this site, we do not hold it. Ask us where we stand on any specific
          framework your organisation requires and you will get a straight
          answer, including where that answer is &ldquo;not yet&rdquo;.
        </p>
        <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
          The same rule governs outcome data. We do not publish efficacy
          percentages we cannot cite.
        </p>
        <Link
          href="/contact"
          className="mt-10 inline-block rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Ask us a procurement question
        </Link>
      </Section>
    </Main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

import { Section, Eyebrow } from '@/components/site/Section';

export const metadata: Metadata = {
  title: 'For customers',
  description:
    'If you already work with Bundle of Rays: how to reach support, what to send when something is wrong, and what to expect back.',
  // Not for cold visitors and not for search. Reachable by link — the
  // address goes in onboarding emails and the footer — so it is neither
  // buried nor advertised.
  robots: { index: false, follow: true },
};

/**
 * The page a warm customer needs and a cold one never sees.
 *
 * Brad asked for the site to be "a communication portal to warm customers"
 * as well as the front door for new ones. The full version of that is a
 * gated area with a login, release notes, documentation and per-customer
 * material — a real build with a real security surface, and it should be
 * done when there is content to put behind the login rather than before.
 *
 * This is the honest first step: everything a customer needs in a bad
 * moment, on one page, with no login to remember. It can grow into the
 * gated version without changing its address.
 *
 * Nothing here promises what has not been agreed. The response commitment
 * matches the contact page. Anything contract-specific is pointed at the
 * contract.
 */

const SUPPORT_STEPS = [
  {
    title: 'Tell us what you saw, not what you think caused it',
    body: 'Which scenario, which headset, what the learner was doing, and what happened instead of what should have. A photo of the headset screen or a screen recording is worth more than a paragraph.',
  },
  {
    title: 'Include when',
    body: 'Date, approximate time, and time zone. It lets us match your report to what the system recorded.',
  },
  {
    title: 'Say how urgent it is, in your terms',
    body: '"A session is running in an hour" and "noticed this last week" get very different responses, and we would rather you told us than we guessed.',
  },
];

export default function CustomersPage() {
  return (
    <main id="main">
      <Section ground="ink" size="lg" bordered={false}>
        <Eyebrow>For customers</Eyebrow>
        <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
          Already working with us? Start here.
        </h1>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
          One page for the moments you need us quickly — a fault mid-session,
          a question before a cohort starts, a change you want made. No
          login, no ticket system, a person on the other end.
        </p>
      </Section>

      <Section ground="paper" size="md" labelledBy="reach-heading">
        <h2
          id="reach-heading"
          className="text-xs uppercase tracking-[0.12em] text-ink-500"
        >
          How to reach us
        </h2>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-ink-900">
              Something is wrong right now
            </h3>
            <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
              Use the direct contact in your deployment agreement — it
              reaches a phone, not an inbox. If you do not have it to hand,
              the <Link href="/contact" className="underline underline-offset-4">contact form</Link>{' '}
              is watched during Australian business hours and we treat
              anything marked urgent as urgent.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink-900">
              A question, a change, a new cohort
            </h3>
            <p className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
              Reply to any email you have from us, or use the contact form and
              choose your role. Every message gets a personal reply, usually
              within two business days — the same commitment we make to
              anyone, and one we keep more carefully for people we already
              work with.
            </p>
          </div>
        </div>
      </Section>

      <Section ground="ink" size="md" labelledBy="report-heading">
        <Eyebrow id="report-heading">What to send when reporting a fault</Eyebrow>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-paper-100">
          Three things make a fault report fast to act on. None of them takes
          more than a minute.
        </p>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {SUPPORT_STEPS.map((step, i) => (
            <li key={step.title}>
              <p className="text-xs uppercase tracking-[0.12em] text-ink-300">
                {i + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-paper-0">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section ground="paper" size="md" labelledBy="coming-heading">
        <h2
          id="coming-heading"
          className="text-xs uppercase tracking-[0.12em] text-ink-500"
        >
          What this page will become
        </h2>
        <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-900">
          A place to see what changed in the last release, download the
          material for your deployment, and raise a request that you can
          track. That needs a login, and it is worth doing properly rather
          than quickly — so for now this page is the human route, and it will
          keep the same address when the rest arrives.
        </p>
        <Link
          href="/contact"
          className="mt-10 inline-block rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-paper-0 transition-opacity hover:opacity-90"
        >
          Get in touch
        </Link>
      </Section>
    </main>
  );
}

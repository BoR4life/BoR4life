import type { Metadata } from 'next';
import Link from 'next/link';

import { PARTNERS } from '@/lib/partners';

export const metadata: Metadata = {
  title: 'Platform',
  description:
    'Contextual environments, AI-driven clinical roleplay, learning analytics — and the four immersive-learning platforms Bundle of Rays distributes alongside its own content.',
};

const PILLARS = [
  {
    title: 'Contextual environments',
    body: 'Learners step into the clinical space the scenario actually happens in — a ward, a resus bay, a patient’s home — rather than a lecture theatre or a checklist. Context is what makes recall transfer to the real setting.',
    image: '/images/hero-bay-poster',
    alt: 'A clinical resuscitation bay, lit and equipped, with a patient monitor showing live vital signs.',
  },
  {
    title: 'AI-driven roleplay',
    body: 'Simulated patients and colleagues respond to what the learner actually says, adapting as the conversation develops. Communication is practised and assessed rather than scripted and skipped.',
    image: '/images/pillar-environment',
    alt: 'Bedside view of the clinical bay, at the vantage a clinician works from.',
  },
  {
    title: 'Learning analytics',
    body: 'Every scenario produces data: which decisions were made and when, how escalation was handled, where procedure diverged from the expected pathway. Visible per learner and per cohort.',
    image: '/images/pillar-analytics',
    alt: 'A patient monitor displaying ECG, oxygen saturation and respiration traces with numeric values.',
  },
];

export default function PlatformPage() {
  return (
    <main id="main">
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-300">
            Platform
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
            Extended reality, clinical roleplay and the data to prove it
            worked.
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            Built by nurses rather than by a studio with a clinical adviser
            attached. That difference shows up in what the scenarios get
            right — and in what they refuse to simplify.
          </p>
        </div>
      </section>

      {PILLARS.map((pillar, i) => (
        <section
          key={pillar.title}
          aria-labelledby={`pillar-${i}`}
          className="border-t border-ink-700 px-6 py-16 md:px-16"
        >
          <div
            className={`mx-auto grid max-w-content items-center gap-12 lg:grid-cols-2 ${
              i % 2 === 1 ? 'lg:[&>figure]:order-first' : ''
            }`}
          >
            <div>
              <h2
                id={`pillar-${i}`}
                className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0"
              >
                {pillar.title}
              </h2>
              <p className="mt-5 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
                {pillar.body}
              </p>
            </div>
            <figure className="overflow-hidden rounded border border-ink-700">
              <picture>
                <source srcSet={`${pillar.image}.avif`} type="image/avif" />
                <source srcSet={`${pillar.image}.webp`} type="image/webp" />
                <img
                  src={`${pillar.image}.webp`}
                  alt={pillar.alt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/9] w-full object-cover"
                />
              </picture>
            </figure>
          </div>
        </section>
      ))}

      {/* Platforms we distribute. The relationship is stated as exactly what
          it is — Bundle of Rays sells and supports these products — because
          "partner" means six things and a procurement reader will ask which.
          No territories, no logos: a distribution agreement is usually
          territory-limited and a logo needs its owner's sign-off. Names and a
          plain line each. See lib/partners.ts for the rules. */}
      <section
        aria-labelledby="distributed-heading"
        className="border-t border-ink-700 bg-paper-100 px-6 py-20 text-ink-900 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <p
            id="distributed-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-500"
          >
            Platforms we distribute
          </p>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em]">
            Our own scenarios, and the best of what else exists.
          </p>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
            Some of what a program needs we author ourselves. Some of it
            someone else has already built well. Bundle of Rays is a
            distributor for four platforms we would choose for our own
            learners — supplied, supported and, where it fits, combined
            with our clinically authored content under one engagement.
          </p>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg bg-ink-900/10 sm:grid-cols-2">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className="bg-paper-100 p-8">
                <h3 className="text-lg font-semibold text-ink-900">
                  {partner.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {partner.what}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-900">
                  {partner.fit}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-ink-500">
            Product names are their owners&rsquo; trademarks. Ask us which
            platforms are available in your market — distribution is
            arranged by territory.
          </p>
        </div>
      </section>

      <section className="border-t border-ink-700 px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <Link
            href="/contact"
            className="inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
          >
            Request a demo
          </Link>
        </div>
      </section>
    </main>
  );
}

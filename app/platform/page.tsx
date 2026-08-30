import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Platform',
  description:
    'Contextual 3D environments, AI-driven clinical roleplay, and learning analytics that capture decisions, communication and procedural accuracy.',
};

const PILLARS = [
  {
    title: 'Contextual environments',
    body: 'Learners step into the clinical space the scenario actually happens in — a ward, a resus bay, a patient’s home — rather than a lecture theatre or a checklist. Context is what makes recall transfer to the real setting.',
    image: '/images/hero-bay-poster',
    alt: 'A clinical resuscitation bay, lit and equipped for a scenario.',
  },
  {
    title: 'AI-driven roleplay',
    body: 'Simulated patients and colleagues respond to what the learner actually says, adapting as the conversation develops. Communication is practised and assessed rather than scripted and skipped.',
    image: '/images/bay-night',
    alt: 'The same bay before a scenario begins, lit by a single warm light.',
  },
  {
    title: 'Learning analytics',
    body: 'Every scenario produces data: which decisions were made and when, how escalation was handled, where procedure diverged from the expected pathway. Visible per learner and per cohort.',
    image: '/images/frontier-state1',
    alt: 'An abstract landscape at first light, representing new capability.',
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

      <section className="border-t border-ink-700 px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <Link
            href="/contact"
            className="inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
          >
            Book a demo
          </Link>
        </div>
      </section>
    </main>
  );
}

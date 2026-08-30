import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Bundle of Rays was founded in 2018 by a nurse who saw that conventional training does not prepare people for high-consequence moments.',
};

/**
 * Founder story.
 *
 * HARD CONSTRAINT: Brad's PhD institution must never appear here. ACU is
 * under a critical NDA, and "PhD research-backed" invites the completion
 * "...at [university]" in a bio, a schema.org alumniOf field, or a
 * conference blurb. Describe the research, never the institution.
 * See docs/00-brand-brief.md, "The ACU trap".
 */

export default function AboutPage() {
  return (
    <main id="main">
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-300">
            About
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
            Built by nurses, for nurses.
          </h1>
        </div>
      </section>

      <section className="border-t border-ink-700 px-6 py-16 md:px-16">
        <div className="mx-auto max-w-content">
          <figure className="mb-16 overflow-hidden rounded border border-ink-700">
            <picture>
              <source
                srcSet="/images/team-learning-development.avif"
                type="image/avif"
              />
              <source
                srcSet="/images/team-learning-development.webp"
                type="image/webp"
              />
              <img
                src="/images/team-learning-development.webp"
                alt="Brad Chesham with a hospital learning and development team, all wearing VR headsets during a Bundle of Rays training session."
                width={2400}
                height={1350}
                loading="lazy"
                decoding="async"
                className="w-full object-cover"
              />
            </picture>
            <figcaption className="border-t border-ink-700 px-4 py-3 text-xs text-ink-300">
              A hospital learning and development team during a Bundle of Rays
              session.
            </figcaption>
          </figure>

          <div className="max-w-prose space-y-6 text-[1.0625rem] leading-relaxed text-ink-300">
            <p>
              Bundle of Rays was founded in 2018 by Brad Chesham, a nurse who
              worked across Australia, the United Kingdom, Afghanistan and
              Iraq.
            </p>
            <p>
              What he saw repeatedly was a gap between how clinicians are
              taught and what actually happens when a patient deteriorates.
              Conventional training covers the knowledge. It does not
              reliably prepare anyone for the moment — the noise, the time
              pressure, the decision made with incomplete information and
              someone watching.
            </p>
            <p>
              The response was a platform that lets practitioners rehearse
              those moments safely, as many times as they need, in the
              environment where they will actually occur. It is grounded in
              doctoral research into immersive learning, and it is authored
              by clinicians rather than by a software team with an adviser
              on retainer.
            </p>
            <p className="text-paper-100">
              Every competitor in this space is a software company that hired
              a clinical expert. Bundle of Rays is the inverse. That is the
              whole difference, and it shows up in every scenario.
            </p>
          </div>

          <div className="mt-16 border-t border-ink-700 pt-10">
            <h2 className="text-xs uppercase tracking-[0.12em] text-ink-300">
              Where we work
            </h2>
            <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-paper-100">
              Australia, the United Kingdom, the United States, Sri Lanka,
              South Korea and India — from single institutions through to
              programs operating at state scale.
            </p>
          </div>

          <Link
            href="/contact"
            className="mt-12 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </main>
  );
}

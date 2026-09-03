import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { SOLUTIONS } from '@/lib/solutions';
import { Section, Eyebrow } from '@/components/site/Section';
import { Reveal } from '@/components/site/Reveal';
import { Main } from '@/components/site/Main';
import { Cta } from '@/components/site/Cta';

export const metadata: Metadata = pageMetadata({
  title: 'Solutions',
  description:
    'Immersive clinical training for nursing education, patient education, and custom content built to your own protocols.',
  path: '/solutions',
});

export default function SolutionsPage() {
  return (
    <Main>
      <Section ground="ink" size="lg" bordered={false} labelledBy="sol-heading">
        <Reveal>
          <Eyebrow id="sol-heading">Solutions</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-paper-0">
            Three ways the same platform gets used.
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            The technology underneath is identical. What changes is who is
            standing in the scenario and what they need to walk away able to
            do.
          </p>
        </Reveal>
      </Section>

      {SOLUTIONS.map((solution, i) => (
        <Section
          key={solution.slug}
          ground={i % 2 === 0 ? 'paper' : 'ink'}
          size="lg"
          labelledBy={`sol-${solution.slug}`}
        >
          <div
            className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
              i % 2 === 1 ? 'lg:[&>*:first-child]:order-last' : ''
            }`}
          >
            <Reveal>
              <figure
                className={`overflow-hidden rounded border ${
                  i % 2 === 0 ? 'border-ink-900/10' : 'border-ink-700'
                }`}
              >
                <picture>
                  <source srcSet={`${solution.image}.avif`} type="image/avif" />
                  <source srcSet={`${solution.image}.webp`} type="image/webp" />
                  <img
                    src={`${solution.image}.webp`}
                    alt={solution.alt}
                    width={2400}
                    height={1350}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/9] w-full object-cover"
                  />
                </picture>
              </figure>
            </Reveal>

            <Reveal step={1}>
              <Eyebrow ground={i % 2 === 0 ? 'paper' : 'ink'}>
                {solution.audience}
              </Eyebrow>
              <h2
                id={`sol-${solution.slug}`}
                className={`mt-4 text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] ${
                  i % 2 === 0 ? 'text-ink-900' : 'text-paper-0'
                }`}
              >
                {solution.name}
              </h2>
              <p
                className={`mt-5 max-w-prose text-[1.0625rem] leading-relaxed ${
                  i % 2 === 0 ? 'text-ink-500' : 'text-ink-300'
                }`}
              >
                {solution.summary}
              </p>
              <Link
                href={`/solutions/${solution.slug}`}
                className={`mt-8 inline-block text-sm font-semibold underline-offset-4 hover:underline ${
                  i % 2 === 0 ? 'text-ink-900 underline' : 'text-signal'
                }`}
              >
                {solution.name} in detail →
              </Link>
            </Reveal>
          </div>
        </Section>
      ))}

      <Section ground="ink" size="lg" labelledBy="sol-cta">
        <Reveal>
          <h2
            id="sol-cta"
            className="max-w-3xl text-[clamp(1.75rem,4vw,3rem)] font-hero leading-tight tracking-[-0.02em] text-paper-0"
          >
            Not sure which fits?
          </h2>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            Most conversations start with a cohort and a problem rather than a
            product. Tell us both and we will tell you honestly whether this
            helps.
          </p>
          <Cta className="mt-10" />
        </Reveal>
      </Section>
    </Main>
  );
}

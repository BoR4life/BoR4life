import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SOLUTIONS, solutionBySlug } from '@/lib/solutions';
import { Section, Eyebrow } from '@/components/site/Section';
import { Reveal } from '@/components/site/Reveal';
import { Main } from '@/components/site/Main';
import { Cta } from '@/components/site/Cta';

/**
 * One dynamic route rather than three near-identical page files. The three
 * solutions share a shape, and hand-copied pages drift the moment one is
 * edited — which on a site making careful claims is how an unreviewed
 * sentence ends up live on only one of them.
 */

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutionBySlug(slug);
  if (!solution) return {};
  return pageMetadata({
    title: solution.name,
    description: solution.summary,
    path: `/solutions/${solution.slug}`,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = solutionBySlug(slug);
  if (!solution) notFound();

  const others = SOLUTIONS.filter((s) => s.slug !== solution.slug);

  return (
    <Main>
      <Section ground="paper" size="lg" bordered={false} labelledBy="sol-heading">
        <Reveal>
          <Eyebrow id="sol-heading">{solution.audience}</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-ink">
            {solution.name}
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
            {solution.lede}
          </p>
        </Reveal>

        <Reveal step={1}>
          <figure className="mt-12 overflow-hidden rounded border border-rule">
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
      </Section>

      <Section ground="surface" size="lg" labelledBy="sol-what">
        <Reveal>
          <Eyebrow id="sol-what">
            What it changes
          </Eyebrow>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {solution.points.map((point, i) => (
            <Reveal key={point.title} step={i}>
              <h2 className="text-lg font-semibold text-ink">
                {point.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {point.body}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 border-t border-rule pt-10">
            <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink">
              We do not publish efficacy percentages we cannot cite. Where a
              deployment produces outcome data, we share the study design, the
              cohort size and the measure alongside the result.
            </p>
            <Link
              href="/evidence"
              className="mt-6 inline-block text-sm font-semibold text-ink underline underline-offset-4"
            >
              Our approach to evidence →
            </Link>
          </div>
        </Reveal>
      </Section>

      <Section ground="paper" size="lg" labelledBy="sol-other">
        <Reveal>
          <Eyebrow id="sol-other">Also available</Eyebrow>
          <ul className="mt-10 grid gap-8 md:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/solutions/${other.slug}`}
                  className="group block border-t border-rule pt-6"
                >
                  <p className="text-xs uppercase tracking-[0.12em] font-label text-muted">
                    {other.audience}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-ink group-hover:text-accent">
                    {other.name} →
                  </p>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                    {other.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <Cta className="mt-14" />
        </Reveal>
      </Section>
    </Main>
  );
}

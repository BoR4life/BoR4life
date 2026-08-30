import type { ReactNode } from 'react';
import Link from 'next/link';

/**
 * Shell for the long-form documents a procurement reader actually reads:
 * the privacy notice and the accessibility statement.
 *
 * These pages have a different job from the rest of the site. Nobody
 * arrives here to be persuaded — they arrive to check something, usually
 * against a compliance checklist, often with Ctrl+F. So this shell is
 * built for scanning rather than for impact: a contents list of real
 * anchors, one column, generous line height, and headings that carry
 * stable ids so a reviewer can send a colleague a link to the exact
 * clause they are querying.
 *
 * Contrast note: this shell renders on the paper ground with ink-900 text.
 * ink-500 is legible as body text ONLY on paper (9.4:1) — never on ink.
 * See app/globals.css and tests/contrast.spec.ts.
 */

export type PolicySection = {
  /** Stable anchor. Changing one breaks inbound links from procurement docs. */
  id: string;
  heading: string;
  body: ReactNode;
};

export function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  /** ISO date. Rendered as a <time> so it is machine-readable. */
  updated: string;
  sections: PolicySection[];
  footer?: ReactNode;
}) {
  return (
    <main id="main" className="bg-paper-100 text-ink-900">
      <div className="mx-auto max-w-content px-6 py-20 md:px-16">
        <p className="text-xs uppercase tracking-[0.12em] text-ink-500">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.02em]">
          {title}
        </h1>
        <div className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
          {intro}
        </div>
        <p className="mt-6 text-sm text-ink-500">
          Last updated{' '}
          <time dateTime={updated}>
            {new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </time>
        </p>

        <nav
          aria-labelledby="contents-heading"
          className="mt-12 border-y border-ink-900/10 py-6"
        >
          <h2
            id="contents-heading"
            className="text-xs uppercase tracking-[0.12em] text-ink-500"
          >
            Contents
          </h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id} className="text-sm">
                <a
                  href={`#${s.id}`}
                  className="text-ink-900 underline decoration-ink-900/30 underline-offset-4 transition-colors hover:decoration-ink-900"
                >
                  <span className="text-ink-500">{i + 1}.</span> {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-16 flex flex-col gap-14">
          {sections.map((s, i) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2
                id={s.id}
                // scroll-mt keeps the heading clear of the sticky header
                // when arriving from an anchor link.
                className="scroll-mt-24 text-xl font-semibold tracking-[-0.01em]"
              >
                <span className="text-ink-500">{i + 1}. </span>
                {s.heading}
              </h2>
              <div className="policy-body mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {footer ? (
          <div className="mt-16 border-t border-ink-900/10 pt-10">{footer}</div>
        ) : null}

        <p className="mt-16 text-sm">
          <Link
            href="/contact"
            className="text-ink-900 underline decoration-ink-900/30 underline-offset-4 transition-colors hover:decoration-ink-900"
          >
            Ask us about anything on this page
          </Link>
        </p>
      </div>
    </main>
  );
}

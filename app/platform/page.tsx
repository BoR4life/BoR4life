import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

import { PARTNERS } from '@/lib/partners';
import { Main } from '@/components/site/Main';
import { Cover } from '@/components/site/Cover';
import { Cta } from '@/components/site/Cta';
import { PlatformClip } from '@/components/site/PlatformClip';

export const metadata: Metadata = pageMetadata({
  title: 'Platform',
  description:
    'Contextual environments, AI-driven clinical roleplay, learning analytics — and the four immersive-learning platforms Bundle of Rays distributes alongside its own content.',
  path: '/platform',
});

/*
  No image per pillar any more. Each carried one of the untextured
  empty-room renders from the abandoned 3D concept — mid-grey and teal on a
  paper ground, and a picture of an empty room arguing for a product that
  puts people in it. Artwork is generated from the pillar's own title
  instead; see lib/cover.ts.
*/
const PILLARS = [
  {
    title: 'Contextual environments',
    body: 'Learners step into the clinical space the scenario actually happens in — a ward, a resus bay, a patient’s home — rather than a lecture theatre or a checklist. Context is what makes recall transfer to the real setting.',
  },
  {
    title: 'AI-driven roleplay',
    body: 'Simulated patients and colleagues respond to what the learner actually says, adapting as the conversation develops. Communication is practised and assessed rather than scripted and skipped.',
  },
  {
    title: 'Learning analytics',
    body: 'Every scenario produces data: which decisions were made and when, how escalation was handled, where procedure diverged from the expected pathway. Visible per learner and per cohort.',
  },
];

export default function PlatformPage() {
  return (
    <Main>
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <p className="text-xs uppercase tracking-[0.12em] font-label text-muted">
            Platform
          </p>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-ink">
            Extended reality, clinical roleplay and the data to prove it
            worked.
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
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
          className="border-t border-rule px-6 py-16 md:px-16"
        >
          <div
            className={`mx-auto grid max-w-content items-center gap-12 lg:grid-cols-2 ${
              i % 2 === 1 ? 'lg:[&>figure]:order-first' : ''
            }`}
          >
            <div>
              <h2
                id={`pillar-${i}`}
                className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink"
              >
                {pillar.title}
              </h2>
              <p className="mt-5 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
                {pillar.body}
              </p>
            </div>
            <Cover name={pillar.title} className="rounded border border-rule" />
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
        className="border-t border-rule bg-surface px-6 py-20 text-ink md:px-16"
      >
        <div className="mx-auto max-w-content">
          <p
            id="distributed-heading"
            className="text-xs uppercase tracking-[0.12em] font-label text-muted"
          >
            Platforms we distribute
          </p>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em]">
            Our own scenarios, and the best of what else exists.
          </p>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
            Some of what a program needs we author ourselves. Some of it
            someone else has already built well. Bundle of Rays is a
            distributor for four platforms we would choose for our own
            learners — supplied, supported and, where it fits, combined
            with our clinically authored content under one engagement.
          </p>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg bg-paper/10 sm:grid-cols-2">
            {PARTNERS.map((partner) => (
              <li key={partner.name} className="bg-surface p-8">
                <h3 className="text-lg font-semibold text-ink">
                  {partner.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {partner.what}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  {partner.fit}
                </p>
                {partner.themes && (
                  <div className="mt-5 border-t border-rule pt-5">
                    <p className="text-xs uppercase tracking-[0.12em] font-label text-muted">
                      Situations covered
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {partner.themes.map((theme) => (
                        <li
                          key={theme.name}
                          className="text-sm leading-relaxed text-ink"
                        >
                          {theme.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-muted">
            Product names are their owners&rsquo; trademarks. Ask us which
            platforms are available in your market — distribution is
            arranged by territory.
          </p>
        </div>
      </section>

      {/* One of the four, actually running.
          It sits on the dark ground rather than inside the light
          platforms section above because the software's own interface is
          dark — a near-black 2:1 band dropped onto paper-100 reads as a
          hole in the page, while on ink-900 it reads as a screen. The
          clip is cropped to its content: the source recording had the
          application window inset in a desktop, and those dead bands
          were the same value as this site's background anyway. */}
      <section
        aria-labelledby="in-use-heading"
        className="border-t border-rule px-6 py-20 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <p
            id="in-use-heading"
            className="text-xs uppercase tracking-[0.12em] font-label text-muted"
          >
            One of them, running
          </p>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
            Anatomy in several views at once.
          </p>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-muted">
            A cadaver lab gives a cohort one specimen and one angle. Here a
            learner holds the skeleton, the organs and the tissue at
            microscopic scale side by side, and every structure is named
            when they touch it.
          </p>

          <div className="mt-12 max-w-4xl">
            <PlatformClip
              stem="organon"
              width={1280}
              height={606}
              source="3D Organon"
              label="The 3D Organon interface running several anatomy views at once: a skeleton with abdominal organs in one window, a magnified tissue block in another, with structures labelled as they are selected."
              caption="Multiple synchronised views — skeletal, organ and microscopic — in one session."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-rule px-6 py-20 md:px-16">
        <div className="mx-auto max-w-content">
          <Cta />
        </div>
      </section>
    </Main>
  );
}

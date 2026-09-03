import Link from 'next/link';
import { Section, Eyebrow } from '@/components/site/Section';
import { Reveal } from '@/components/site/Reveal';
import { ScenarioVideo } from '@/components/site/ScenarioVideo';
import { VideoEmbed } from '@/components/site/VideoEmbed';
import { Main } from '@/components/site/Main';
import { Cta } from '@/components/site/Cta';
import { AudienceSelect } from '@/components/site/AudienceSelect';
import { PARTNERS } from '@/lib/partners';
import type { Metadata } from 'next';

/**
 * The homepage deliberately keeps the root layout's title and description —
 * they were written for it — but it still needs its own canonical. Without
 * one, the apex, www and the preview domain all serve this page with nothing
 * saying which address is the real one.
 */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Home page.
 *
 * Type-led, on purpose. The 3D narrative that used to open this page was
 * removed after Brad looked at it and said it had not hit the spot — and my
 * own review agreed: the frontier frame was the weakest image on the site,
 * and the one every visitor saw first. The 3D pipeline is kept in the repo
 * for later (docs/03, docs/05, scripts/) but nothing from it ships here.
 *
 * What replaces it is the thing the site actually has that nobody else
 * does: a clear argument, a real recorded scenario, a partner's real
 * de-escalation footage, and a founder who is a nurse. No render, no
 * stock photo, nothing that pretends. When the photo shoot happens
 * (docs/06-photography-audit.md) real imagery slots into the founder
 * section and the platform page without restructuring anything.
 *
 * Two rules carried over:
 *  - The client list is inside the first viewport on a 1440x900 desktop.
 *    The procurement reader must not have to hunt for it.
 *  - NO fabricated numbers. Every figure is one Brad has confirmed: founded
 *    2018, five years with Queensland Health, six markets, four named
 *    institutions. No efficacy percentages, because none have been supplied
 *    with a citation (docs/00-brand-brief.md, PROHIBITED list).
 */

const CLIENTS = [
  { name: 'Queensland Health', detail: 'Five years, longest-running' },
  { name: 'Ohio State University', detail: 'Innovation Fellow — two projects' },
  { name: 'Taegu Science University', detail: 'Repeat engagements' },
  { name: 'DY Patil, Pune', detail: 'Two years running' },
];

const MEASURES = [
  {
    title: 'Clinical decisions',
    body: 'Which action was taken, at which point in a deteriorating scenario, and what was not done.',
  },
  {
    title: 'Communication',
    body: 'What was said, to whom, and when — including whether and how the learner escalated.',
  },
  {
    title: 'Procedural accuracy',
    body: 'Sequence, technique and omissions against the expected pathway, recorded per attempt.',
  },
];

const FACTS = [
  { value: '2018', label: 'Founded by a nurse' },
  { value: '5 years', label: 'With Queensland Health' },
  { value: '6', label: 'Markets worldwide' },
];

const MARKETS = [
  'Australia',
  'United Kingdom',
  'United States',
  'Sri Lanka',
  'South Korea',
  'India',
];

// The de-escalation themes come from the Bodyswaps entry rather than being
// retyped here, so the homepage and /platform can never drift apart on what
// we say is deployable. See lib/partners.ts for why the list is short.
const DEESCALATION = PARTNERS.find((p) => p.name === 'Bodyswaps')?.themes ?? [];

export default function Home() {
  return (
    <Main>
      {/* 1. Opening — a claim and its proof, in one composition.
          Two changes from the version this replaces, both structural rather
          than decorative.
          The hero used to occupy the left half of a 1440px canvas with the
          right half empty. Unbalanced whitespace does not read as confidence,
          it reads as a layout that did not finish loading, and it was the
          first thing anyone saw.
          The client names used to sit in their own band underneath. Putting
          them in the right column instead means the claim and the evidence
          for it are in the same glance, which is the whole argument of this
          site compressed into one screen — and it removes a section rather
          than adding one. */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-ink-700 px-6 pb-20 pt-20 md:px-16 md:pb-28 md:pt-32"
      >
        <div className="mx-auto grid max-w-content gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.14em] font-label text-signal">
              Immersive clinical training
            </p>
            {/* Tighter than the old -0.03em and a step larger. At this size
                the tracking is doing real work: Inter Tight's narrow
                sidebearings hold at -0.04em, where the previous native stack
                would have collided. */}
            <h1
              id="hero-heading"
              className="mt-6 text-[clamp(2.75rem,6.2vw,5.25rem)] font-hero leading-[0.94] tracking-[-0.04em] text-paper-0"
            >
              Every practitioner meets a first time.
            </h1>
            <p className="mt-9 max-w-[44ch] text-[clamp(1.125rem,1.5vw,1.3125rem)] leading-[1.55] text-ink-300">
              Rehearse the deteriorating patient, the difficult conversation
              and the unfamiliar procedure before they are real — in the
              environment where they will happen, with every decision
              recorded.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Cta />
              <Link
                href="/evidence"
                className="text-sm font-medium text-ink-300 underline decoration-ink-500 decoration-1 underline-offset-[6px] transition-colors hover:text-paper-0 hover:decoration-signal"
              >
                What we measure, and why we do not publish percentages
              </Link>
            </div>
          </div>

          {/* Proof, beside the claim. Hairline-separated rather than boxed:
              a list of institutions needs no container to read as a list, and
              a border would make it look like a widget rather than a fact. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <h2
              id="clients-heading"
              className="text-xs uppercase tracking-[0.14em] font-label text-ink-300"
            >
              Trusted in practice
            </h2>
            <ul className="mt-7">
              {CLIENTS.map((client, i) => (
                <li
                  key={client.name}
                  className="border-t border-ink-700 py-4 first:border-t-0 first:pt-0"
                >
                  <Reveal step={i}>
                    <p className="text-[0.9375rem] font-semibold leading-snug text-paper-0">
                      {client.name}
                    </p>
                    <p className="tabular mt-1 text-[0.8125rem] leading-snug text-ink-300">
                      {client.detail}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. The problem */}
      {/*
        Self-select, placed directly under the hero.

        A visitor arrives with one of three quite different first questions,
        and until now the homepage answered them in a fixed order that
        suited none of them in particular. Asking is more honest than
        inferring from a referrer, and cheaper: no cookie, no vendor, and
        the answer is better than anything inference would have produced.

        Deliberately a quiet band and not a modal. An interstitial that
        blocks the page would cost the very readers it means to help — a
        procurement reader who wanted the evidence page, and every crawler.
      */}
      <Section ground="ink" size="sm" labelledBy="audience-heading">
        <Reveal>
          <Eyebrow id="audience-heading">Start where you are</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-[clamp(1.375rem,2.1vw,1.75rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
            Three readers, three different first questions.
          </h2>
          <p className="mt-5 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            Say which you are and we will point you at the part that answers
            yours first. Nothing is hidden either way.
          </p>
        </Reveal>
        <Reveal step={1}>
          <AudienceSelect />
        </Reveal>
      </Section>

      <Section ground="paper" size="lg" labelledBy="problem-heading">
        <Reveal>
          <Eyebrow ground="paper" id="problem-heading">
            The problem
          </Eyebrow>
          <p className="mt-6 max-w-4xl text-[clamp(1.75rem,4vw,3.25rem)] font-hero leading-[1.1] tracking-[-0.02em]">
            Knowing what to do and doing it under pressure are different
            skills. Only one of them gets taught.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2 md:gap-16">
            <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
              A deteriorating patient does not wait for recall. The moment
              arrives with noise, time pressure, incomplete information and
              someone watching — and conventional training leaves that moment
              almost entirely untested.
            </p>
            <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
              Practitioners can pass every written assessment and still meet
              their first real emergency without ever having rehearsed one.
              That gap is not a knowledge problem. It is a practice problem.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* 4. Platform. Real footage, twice — our own recorded scenario, then
          a partner's de-escalation roleplay. After the problem is stated is
          the moment a visitor wants to see the thing rather than read
          another description of it. The three illustrated pillar cards that
          used to follow duplicated the platform page and were all renders;
          gone. */}
      <Section ground="ink" size="lg" labelledBy="platform-heading">
        <Reveal>
          <Eyebrow id="platform-heading">The platform</Eyebrow>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
            Rehearse the moment. Capture what happened. Show the change.
          </p>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <ScenarioVideo />
          </Reveal>
          <Reveal step={1}>
            <h3 className="text-xl font-semibold text-paper-0">
              This is a scenario, not a showreel.
            </h3>
            <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
              Sterile field, ultrasound guidance, a colleague who responds to
              what you say. The learner works the procedure in sequence and
              the system records every decision along the way — including the
              ones not taken.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-5 lg:gap-16">
          <Reveal className="lg:col-span-3">
            <VideoEmbed
              videoId="0h1FcfavIwU"
              source="Bodyswaps"
              title="De-escalation and aggression management"
              summary="Conversational practice for the situations that escalate fastest — where what you say, and when, changes the outcome."
            />
          </Reveal>
          <Reveal step={1} className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-paper-0">
              The conversation is the skill.
            </h3>
            <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
              De-escalation cannot be learned from a policy document. It
              needs a person in front of you who reacts to your tone, your
              distance and your timing — and who does not reset politely when
              you get it wrong.
            </p>
            <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
              Simulated patients and colleagues respond to what the learner
              actually says and adapt as the exchange develops, so
              communication is practised and assessed rather than scripted
              and skipped.
            </p>
          </Reveal>
        </div>

        {/* Name the situations. A clinical educator with an occupational
            violence budget needs to see their own problem on the page, not
            a general claim about "communication skills" — and the honest
            framing is that this is Bodyswaps' content, which we distribute
            and support. lib/partners.ts holds the list. */}
        <Reveal>
          <div className="mt-16 border-t border-ink-700 pt-10">
            <h3 className="text-xl font-semibold text-paper-0">
              The situations it covers
            </h3>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-300">
              Delivered through Bodyswaps, which Bundle of Rays distributes
              and supports. If the situation your staff face is not here, ask
              — that is a better conversation than a catalogue.
            </p>
            <dl className="mt-10 grid gap-10 md:grid-cols-3">
              {DEESCALATION.map((theme) => (
                <div key={theme.name}>
                  <dt className="text-base font-semibold text-paper-0">
                    {theme.name}
                  </dt>
                  <dd className="mt-3 text-sm leading-relaxed text-ink-300">
                    {theme.body}
                  </dd>
                </div>
              ))}
            </dl>

            {/*
              Two stills from the platform. Held at a deliberately modest
              width: the sources are 686px and 745px wide, so anything
              wider than about a third of the grid is upscaling, and an
              upscaled screenshot of a product looks worse than no
              screenshot at all. Same reasoning as the scenario clip —
              see components/site/ScenarioVideo.tsx.

              The second one is the more useful of the pair. It shows the
              behaviours being named — raised pitch, eye contact — which is
              the site's claim that communication is assessed rather than
              observed, in a single frame.
            */}
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:max-w-3xl">
              <figure>
                <picture>
                  <source
                    srcSet="/images/deescalation-roleplay.avif"
                    type="image/avif"
                  />
                  <img
                    src="/images/deescalation-roleplay.webp"
                    alt="Two people talking across a café counter, both mid-gesture — a de-escalation roleplay seen from the learner's position."
                    width={686}
                    height={386}
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded border border-ink-700 bg-ink-700"
                  />
                </picture>
                <figcaption className="mt-3 text-xs leading-relaxed text-ink-300">
                  The exchange itself. The other person responds to what the
                  learner says, and does not reset politely when it goes
                  badly.
                </figcaption>
              </figure>
              <figure>
                <picture>
                  <source
                    srcSet="/images/deescalation-feedback.avif"
                    type="image/avif"
                  />
                  <img
                    src="/images/deescalation-feedback.webp"
                    alt="A debrief in a clinical room with behaviours labelled on screen: raised pitch or shouting, and excessive eye contact."
                    width={745}
                    height={287}
                    loading="lazy"
                    decoding="async"
                    className="w-full rounded border border-ink-700 bg-ink-700"
                  />
                </picture>
                <figcaption className="mt-3 text-xs leading-relaxed text-ink-300">
                  And the debrief. Specific behaviours are named — raised
                  pitch, eye contact — rather than a score with no reason
                  attached to it.
                </figcaption>
              </figure>
            </div>

            {/*
              Credited here and not only above the themes. The attribution
              two hundred pixels up the page is true but easy to scroll
              past, and a reader who lands on these frames should not be
              able to mistake another company's interface for ours. Same
              reasoning as the trademark line on /platform.
            */}
            <p className="mt-6 max-w-prose text-xs leading-relaxed text-ink-300">
              Both screens are Bodyswaps&rsquo; software. Bundle of Rays
              distributes and supports it; the product and its interface are
              Bodyswaps&rsquo; own.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <Link
            href="/platform"
            className="mt-14 inline-block text-sm font-semibold text-signal underline-offset-4 hover:underline"
          >
            See how the platform works →
          </Link>
        </Reveal>
      </Section>

      {/* 5. What we measure — the evidence framing, without inventing
          outcome statistics we cannot cite. */}
      <Section ground="paper" size="lg" labelledBy="measure-heading">
        <Reveal>
          <Eyebrow ground="paper" id="measure-heading">
            What we measure
          </Eyebrow>
          <p className="mt-6 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em]">
            Training you can put in front of a review committee.
          </p>
        </Reveal>

        <dl className="mt-14 grid gap-10 md:grid-cols-3">
          {MEASURES.map((m, i) => (
            <Reveal key={m.title} step={i}>
              <dt className="text-lg font-semibold">{m.title}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-500">
                {m.body}
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal>
          <div className="mt-16 border-t border-ink-900/10 pt-10">
            <p className="max-w-prose text-[1.0625rem] leading-relaxed">
              We do not publish efficacy percentages we cannot cite. Where a
              deployment produces outcome data, we share the study design,
              the cohort size and the measure alongside the result.
            </p>
            <Link
              href="/evidence"
              className="mt-6 inline-block text-sm font-semibold text-ink-900 underline underline-offset-4"
            >
              Read our approach to evidence →
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* 6. Deployments */}
      <Section ground="ink" size="lg" labelledBy="markets-heading">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <Eyebrow id="markets-heading">Where we work</Eyebrow>
            <p className="mt-6 text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em] text-paper-0">
              From a single ward to a state-level program.
            </p>
            <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
              Bundle of Rays runs in teaching hospitals, universities and
              national nursing programs across six markets — expanding from
              institutional deployments toward state-level delivery.
            </p>
          </Reveal>

          <Reveal step={1}>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-4">
              {MARKETS.map((market) => (
                <li
                  key={market}
                  className="border-b border-ink-700 pb-3 text-paper-100"
                >
                  {market}
                </li>
              ))}
            </ul>

            <dl className="mt-12 grid grid-cols-3 gap-6">
              {FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    {/* Bigger, tighter and tabular. These three figures are
                        what a buyer repeats to a colleague, so they are set
                        as display type rather than as large body text —
                        and tabular-nums keeps the digits on a common width
                        so the three read as a set instead of three
                        unrelated strings. */}
                    <span className="tabular block text-[clamp(2rem,4vw,3.25rem)] font-hero leading-none tracking-[-0.035em] text-signal">
                      {fact.value}
                    </span>
                    <span className="mt-3 block max-w-[18ch] text-[0.8125rem] leading-snug text-ink-300">
                      {fact.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      {/* 7. Founder. The differentiator, and the reason to trust the rest.
          The one real photograph on the site lives here. */}
      <Section ground="paper" size="lg" labelledBy="founder-heading">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <figure className="overflow-hidden rounded border border-ink-900/10">
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
                  alt="Brad Chesham with a hospital learning and development team, all wearing VR headsets during a Bundle of Rays session."
                  width={2400}
                  height={1350}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                />
              </picture>
            </figure>
          </Reveal>

          <Reveal step={1}>
            <Eyebrow ground="paper" id="founder-heading">
              Built by nurses, for nurses
            </Eyebrow>
            <p className="mt-6 text-[clamp(1.5rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em]">
              Most of this industry is software companies that hired a
              clinician. We are the inverse.
            </p>
            <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
              Bundle of Rays was founded in 2018 by Brad Chesham, a nurse who
              worked across Australia, the United Kingdom, Afghanistan and
              Iraq. The scenarios are written by clinicians and grounded in
              doctoral research into immersive learning.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-block text-sm font-semibold text-ink-900 underline underline-offset-4"
            >
              Read the founder story →
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* 8. CTA */}
      <Section ground="ink" size="lg" labelledBy="cta-heading">
        <Reveal>
          <div className="max-w-3xl">
            <h2
              id="cta-heading"
              className="text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-paper-0"
            >
              See it with your own cohort in mind.
            </h2>
            <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
              Tell us what you are trying to achieve and we will show you how
              it works in practice — including the outcomes data your
              procurement process is going to ask for.
            </p>
            <Cta className="mt-10" />
          </div>
        </Reveal>
      </Section>
    </Main>
  );
}

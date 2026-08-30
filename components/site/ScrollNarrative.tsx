'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The opening narrative: the frontier becomes the ward.
 *
 * Documented in docs/05-scroll-narrative.md. One continuous light source
 * carries the sequence — the first ray cresting a dark ridge, the same
 * light as a single strip over an empty bed, and finally the ceiling
 * panels of a bay with the lights on. The company is called Bundle of
 * Rays; the ray is the protagonist.
 *
 * WHY CROSS-FADE AND NOT A SCROLL-SCRUBBED CAMERA
 * Scroll-driven camera motion is a textbook vection trigger. The audience
 * here is nurses and clinical educators who understand vestibular
 * dysfunction professionally, and a company selling simulator-sickness-free
 * VR cannot ship a website that induces it. The world changes; the
 * viewpoint never moves. Cross-fade is not vection.
 *
 * WHY IT RESOLVES INTO THE CLIENT LIST
 * A three-screen atmospheric opening that delays the evidence is the
 * portfolio-site failure mode this project has argued against throughout.
 * So the sequence is compact, and the final state — the lights coming on —
 * is the same moment the credibility line appears. The story lands on
 * Queensland Health rather than postponing it.
 *
 * DEGRADATION
 * Without JavaScript, or with reduced motion, the final lit state renders
 * immediately and every caption is present in normal document flow. The
 * narrative is atmosphere; it never carries information on its own.
 */

type Stage = {
  src: string;
  alt: string;
  eyebrow: string;
  line: string;
};

const STAGES: Stage[] = [
  {
    src: '/images/frontier-state1',
    alt: 'A dark landscape before dawn, with the first light cresting a distant ridge.',
    eyebrow: 'The frontier',
    line: 'Every practitioner meets a first time.',
  },
  {
    src: '/images/bay-night',
    alt: 'A clinical bay at night, empty, lit by a single warm strip light.',
    eyebrow: 'The moment before',
    line: 'It arrives without warning, and it does not wait.',
  },
  {
    src: '/images/hero-bay-poster',
    alt: 'The same clinical bay with the lights on, fully equipped, monitor showing vital signs.',
    eyebrow: 'Ready',
    line: 'Practise the moment before it counts.',
  },
];

export function ScrollNarrative() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [progress, setProgress] = useState(1); // default = final state

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setEnhanced(true);
    setProgress(0);

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Distance scrolled through the tall wrapper, normalised 0..1.
        const travel = rect.height - window.innerHeight;
        const p = travel <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / travel));
        setProgress(p);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Exactly one stage is opaque at a time; the CSS transition does the
  // cross-fade. An earlier version ramped opacity linearly per stage, which
  // allowed two layers to be fully opaque at once — and since they are
  // absolutely stacked, the later one in DOM order silently covered the
  // first, so the opening frame was never visible. Discrete is correct and
  // much easier to reason about.
  const last = STAGES.length - 1;
  const activeIndex = !enhanced
    ? last
    : Math.min(last, Math.floor(progress * STAGES.length));
  const opacityFor = (i: number) => (i === activeIndex ? 1 : 0);

  return (
    <div
      ref={wrapRef}
      // Two extra viewports of travel: enough for the sequence to breathe,
      // short enough that the client list is two scrolls away rather than
      // four.
      className={enhanced ? 'relative h-[300vh]' : 'relative'}
      // Exposed so tests can assert the sequence state directly rather than
      // inferring it from computed opacity mid-transition.
      data-stage={activeIndex}
      data-enhanced={enhanced ? 'true' : 'false'}
    >
      <div
        className={
          enhanced
            ? 'sticky top-0 h-screen overflow-hidden bg-ink-900'
            : 'relative aspect-[16/9] w-full overflow-hidden bg-ink-900'
        }
      >
        {STAGES.map((stage, i) => (
          <picture key={stage.src}>
            <source srcSet={`${stage.src}.avif`} type="image/avif" />
            <source srcSet={`${stage.src}.webp`} type="image/webp" />
            <img
              src={`${stage.src}.webp`}
              alt={i === last ? stage.alt : ''}
              // The final frame is the one that renders without JS, so it
              // is the LCP candidate and gets priority.
              fetchPriority={i === last ? 'high' : 'low'}
              loading={i === last ? 'eager' : 'lazy'}
              decoding="async"
              aria-hidden={i === last ? undefined : true}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-reveal"
              // z-index makes the active stage authoritative. Opacity alone
              // proved fragile: during a cross-fade two absolutely-stacked
              // layers can both be opaque for a frame, and the later one in
              // DOM order silently covered the intended image — which is
              // why the opening frontier frame was never visible.
              style={{ opacity: opacityFor(i), zIndex: i === activeIndex ? 2 : 1 }}
            />
          </picture>
        ))}

        {/* Scrim. The lit final frame is bright, and the caption must clear
            contrast against every stage, not just the dark ones. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[3] bg-gradient-to-t from-ink-900 via-ink-900/65 to-ink-900/25"
        />

        <div className="absolute inset-0 z-[4] flex items-end">
          <div
            // When enhanced, all captions occupy one grid cell so they
            // cross-fade in place rather than shifting layout. Without JS
            // they stack in normal flow and read as a short sequence.
            className={`mx-auto w-full max-w-content px-6 pb-16 md:px-16 md:pb-24 ${
              enhanced ? 'grid' : ''
            }`}
          >
            {/* Captions are all in the DOM. With JS the inactive ones are
                hidden from assistive tech and faded out; without it, they
                stack and read as a short sequence. */}
            {STAGES.map((stage, i) => (
              <div
                key={stage.eyebrow}
                aria-hidden={enhanced && i !== activeIndex ? true : undefined}
                className={
                  enhanced
                    ? 'transition-opacity duration-500 ease-reveal'
                    : 'mb-8'
                }
                style={
                  enhanced
                    ? {
                        gridArea: '1 / 1',
                        opacity: i === activeIndex ? 1 : 0,
                      }
                    : undefined
                }
              >
                <p className="text-xs uppercase tracking-[0.12em] text-signal">
                  {stage.eyebrow}
                </p>
                <p className="mt-4 max-w-4xl text-[clamp(2rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-paper-0">
                  {stage.line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

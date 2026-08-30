'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Looping product clip.
 *
 * Real captured footage from a scenario, so it carries authenticity no
 * render can. It is also 720x405 native, which is why it is deliberately
 * held in a constrained column rather than run full-bleed — upscaled to
 * hero width it would look soft and cheapen the thing it is meant to prove.
 *
 * Behaviour rules:
 *  - Poster renders first and is never removed, so there is no layout shift
 *    and no gap if the video never loads.
 *  - `prefers-reduced-motion` means the clip never plays. It holds on the
 *    poster with a visible control to start it, so the choice stays with
 *    the viewer. For this audience that is a medical consideration
 *    (docs/03-3d-production-spec.md), not a stylistic one.
 *  - Muted + playsInline, or mobile browsers refuse to autoplay at all.
 */
export function ScenarioVideo({ className = '' }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <figure className={`overflow-hidden rounded border border-ink-700 ${className}`}>
      <div className="relative">
        <video
          ref={videoRef}
          // autoPlay only when motion is welcome; otherwise the poster holds.
          autoPlay={!reduced}
          loop
          muted
          playsInline
          preload="metadata"
          poster="/video/scenario.webp"
          width={720}
          height={405}
          aria-label="A recorded Bundle of Rays scenario: ultrasound-guided vascular access, seen from the learner's point of view."
          className="aspect-[16/9] w-full bg-ink-700 object-cover"
        >
          <source src="/video/scenario-av1.mp4" type="video/mp4; codecs=av01.0.05M.08" />
          <source src="/video/scenario-h264.mp4" type="video/mp4" />
        </video>

        {reduced && (
          <button
            type="button"
            onClick={toggle}
            className="absolute bottom-3 right-3 rounded-full bg-ink-900/90 px-4 py-2 text-xs font-semibold text-paper-100"
          >
            {playing ? 'Pause clip' : 'Play clip'}
          </button>
        )}
      </div>
      <figcaption className="border-t border-ink-700 px-4 py-3 text-xs text-ink-300">
        Recorded in-headset: ultrasound-guided vascular access, from the
        learner&rsquo;s point of view.
      </figcaption>
    </figure>
  );
}

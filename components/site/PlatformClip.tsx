'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A short loop of a distributed platform in use.
 *
 * Deliberately generic rather than a 3D-Organon-specific component: there
 * are four platforms and the second one to get a clip should not need a
 * second component.
 *
 * The behaviour rules are the same ones ScenarioVideo already establishes,
 * and they are not stylistic:
 *  - the poster renders first and is never removed, so there is no layout
 *    shift and no gap if the video never loads;
 *  - `prefers-reduced-motion` holds on the poster with a visible control to
 *    start it, so the choice stays with the viewer. For an audience that
 *    includes people with vestibular conditions that is a medical
 *    consideration, not a preference;
 *  - muted and playsInline, or mobile browsers refuse to autoplay at all.
 *
 * `source` is required and rendered visibly. This is a partner's product,
 * not ours, and a reader must not have to guess whose software they are
 * looking at.
 */
export function PlatformClip({
  stem,
  width,
  height,
  source,
  label,
  caption,
}: {
  /** Basename under /public/video, without codec suffix. */
  stem: string;
  width: number;
  height: number;
  /** Whose product this is. Rendered, not just documented. */
  source: string;
  /** Accessible description of what the clip shows. */
  label: string;
  caption: string;
}) {
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
    <figure className="overflow-hidden rounded border border-rule">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay={!reduced}
          loop
          muted
          playsInline
          preload="metadata"
          poster={`/video/${stem}.webp`}
          width={width}
          height={height}
          aria-label={label}
          className="w-full bg-surface"
        >
          <source
            src={`/video/${stem}-av1.mp4`}
            type="video/mp4; codecs=av01.0.05M.08"
          />
          <source src={`/video/${stem}-h264.mp4`} type="video/mp4" />
        </video>

        {reduced && (
          <button
            type="button"
            onClick={toggle}
            className="absolute bottom-3 right-3 rounded-full bg-paper/90 px-4 py-2 text-xs font-semibold text-ink"
          >
            {playing ? 'Pause clip' : 'Play clip'}
          </button>
        )}
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule px-4 py-3 text-xs leading-relaxed text-muted">
        <span>{caption}</span>
        {/*
          ink-300, NOT ink-500. ink-500 is a border token: at 1.9:1 on
          ink-900 it fails AA for text, which is the exact defect this
          repository already shipped once (see CLAUDE.md rule 4). The
          attribution is distinguished from the caption by position and
          uppercase tracking instead of by colour.
        */}
        <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted">
          {source}
        </span>
      </figcaption>
    </figure>
  );
}

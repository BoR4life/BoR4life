'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useCanRender3D, useNearViewport } from '@/lib/capability';

/**
 * Poster-first, capability-gated 3D viewport.
 *
 * The ordering below is what keeps LCP under budget:
 *   1. The pre-rendered still paints immediately and IS the LCP element.
 *   2. Nothing WebGL-related is imported until the section is near the
 *      viewport AND the device passes the capability gate.
 *   3. The canvas fades in over the still once the scene is ready. If it
 *      never loads, the visitor still sees the final composition.
 *
 * The still is never removed from the DOM, so there is no layout shift and
 * no flash if WebGL fails after mounting.
 *
 * This component deliberately renders NO copy of its own. It previously
 * carried the site's headline and a scrim, from back when it was going to be
 * the hero — and the moment it was actually mounted inside a section that
 * has its own heading, that baked-in copy produced a second <h1> on the page
 * (a WCAG failure) competing with the real one, over a scrim that dimmed the
 * very scene the section exists to show. A viewport component should not own
 * page copy; the page does, and passes what the image means through `alt`.
 */

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => null,
});

export function HeroCanvas({
  /**
   * Describes the scene for anyone who never sees it — a screen reader
   * user, or a visitor whose device fails the capability gate. Required,
   * not optional: no fact may exist only inside the canvas
   * (docs/03-3d-production-spec.md), and a default would quietly ship the
   * wrong description the first time this is reused.
   */
  alt,
  poster = '/images/hero-bay-poster',
  priority = false,
}: {
  alt: string;
  poster?: string;
  priority?: boolean;
}) {
  const { ref, near } = useNearViewport<HTMLDivElement>();
  const canRender = useCanRender3D();
  const [sceneReady, setSceneReady] = useState(false);

  const mountScene = near && canRender === true;

  return (
    <div
      ref={ref}
      className="relative aspect-[16/9] w-full overflow-hidden rounded border border-ink-700 bg-ink-900"
    >
      {/*
        A <picture> rather than next/image: these posters are already
        encoded to AVIF+WebP inside the asset budget by the render
        pipeline, so the optimizer adds nothing — and next/image emits an
        inline style attribute that a strict style-src (no 'unsafe-inline')
        blocks.
      */}
      <picture>
        <source srcSet={`${poster}.avif`} type="image/avif" />
        <source srcSet={`${poster}.webp`} type="image/webp" />
        <img
          src={`${poster}.webp`}
          alt={alt}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {mountScene && (
        <div
          // aria-hidden because the poster underneath carries the same
          // composition and its alt text carries the meaning. Announcing
          // both would read the scene twice, and OrbitControls offers a
          // screen-reader or keyboard user no affordance to act on anyway.
          aria-hidden="true"
          // Class, not an inline style: a style attribute is refused by
          // style-src, so the canvas would jump to full opacity instead of
          // cross-fading over the poster.
          className={`absolute inset-0 transition-opacity duration-700 ease-reveal ${
            sceneReady ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <HeroScene onReady={() => setSceneReady(true)} />
        </div>
      )}

      {/*
        Affordance. A canvas that responds to dragging with no sign that it
        does is a feature nobody finds. Shown only once the scene is
        actually live, so it never promises interactivity that the poster
        alone cannot deliver.
      */}
      {sceneReady && (
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink-900/75 px-3 py-1 text-xs text-paper-100"
        >
          Drag to look around
        </p>
      )}
    </div>
  );
}

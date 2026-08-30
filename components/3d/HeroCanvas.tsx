'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useCanRender3D, useNearViewport } from '@/lib/capability';

/**
 * Poster-first, capability-gated 3D hero.
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
 */

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => null,
});

export function HeroCanvas() {
  const { ref, near } = useNearViewport<HTMLDivElement>();
  const canRender = useCanRender3D();
  const [sceneReady, setSceneReady] = useState(false);

  const mountScene = near && canRender === true;

  return (
    <div
      ref={ref}
      className="relative aspect-[16/9] w-full overflow-hidden bg-ink-900"
    >
      {/*
        A <picture> rather than next/image: these posters are already
        encoded to AVIF+WebP inside the asset budget by the render
        pipeline, so the optimizer adds nothing — and next/image emits an
        inline style attribute that a strict style-src (no 'unsafe-inline')
        blocks. fetchPriority="high" preserves the LCP preload behaviour
        that mattered here.
      */}
      <picture>
        <source srcSet="/images/hero-bay-poster.avif" type="image/avif" />
        <source srcSet="/images/hero-bay-poster.webp" type="image/webp" />
        <img
          src="/images/hero-bay-poster.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {mountScene && (
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700 ease-reveal"
          style={{ opacity: sceneReady ? 1 : 0 }}
        >
          <HeroScene onReady={() => setSceneReady(true)} />
        </div>
      )}

      {/*
        The text alternative. Not a fallback — it ships always, because no
        fact may exist only inside the canvas (docs/03-3d-production-spec.md).
      */}
      {/*
        Scrim. The poster is a bright clinical space, so text over it fails
        WCAG contrast without one — budgets.json requires 4.5:1 for body
        text and this is the only way to guarantee it across the whole
        image rather than hoping the crop stays dark.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-transparent"
      />

      <div className="absolute inset-0 flex items-end p-6 md:p-16">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.12em] text-paper-100/90">
            Clinically authored immersive training
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-paper-0">
            Practise the moment before it counts.
          </h1>
        </div>
      </div>
    </div>
  );
}

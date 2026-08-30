/**
 * Reference implementation — the poster-first, capability-gated 3D hero.
 *
 * This is the ONLY live WebGL scene on the site. Copy this pattern; do not
 * reinvent it. The ordering below is what keeps LCP under budget:
 *
 *   1. The pre-rendered still paints immediately and IS the LCP element.
 *   2. Nothing WebGL-related is even imported until the section is near
 *      the viewport AND the device passes the capability gate.
 *   3. The canvas fades in over the still once the model has decoded.
 *      If it never decodes, the visitor still sees the final composition.
 *
 * A visitor on a locked-down hospital laptop gets a fast, complete page.
 * That visitor is the buyer who matters most.
 */

'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/** The whole 3D runtime — three, r3f, drei — is isolated in this chunk. */
const WardScene = dynamic(() => import('./WardScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * Decide whether this device should run WebGL at all.
 *
 * Returning false is not a degraded experience — it is a faster one. The
 * still is the same composition the canvas renders.
 */
function useCanRender3D(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Respect the user before the hardware.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return setOk(false);
    }

    const conn = (navigator as any).connection;
    if (conn?.saveData) return setOk(false);
    if (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType)) {
      return setOk(false);
    }

    // deviceMemory is Chromium-only; absent means "unknown", not "low".
    const mem = (navigator as any).deviceMemory;
    if (typeof mem === 'number' && mem < 4) return setOk(false);

    // Probe WebGL2 without retaining the context.
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) return setOk(false);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      return setOk(false);
    }

    setOk(true);
  }, []);

  return ok;
}

/** Only mount the scene once it is actually about to be seen. */
function useNearViewport<T extends Element>(rootMargin = '200px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}

export function Hero3D() {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const canRender = useCanRender3D();
  const [sceneReady, setSceneReady] = useState(false);

  const mountScene = near && canRender === true;

  return (
    <div ref={ref} className="relative aspect-[16/9] w-full overflow-hidden bg-ink-900">
      {/*
        LCP element. `priority` preloads it. It is never removed from the
        DOM — the canvas layers over it — so there is no layout shift and
        no flash if WebGL fails after mounting.
      */}
      <Image
        src="/images/hero-ward-poster.avif"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {mountScene && (
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: sceneReady ? 1 : 0 }}
        >
          <WardScene onReady={() => setSceneReady(true)} />
        </div>
      )}

      {/*
        The text alternative. This is not a fallback — it ships always,
        because no fact may exist only inside the canvas.
      */}
      <div className="absolute inset-0 flex items-end p-8 md:p-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-300">
            Clinically authored immersive training
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,6vw,7rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-paper-000">
            Practise the moment before it counts.
          </h1>
        </div>
      </div>
    </div>
  );
}

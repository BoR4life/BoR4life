'use client';

import { useEffect, useState } from 'react';

/**
 * Decide whether this device should run WebGL at all.
 *
 * Returning false is not a degraded experience — it is a faster one. The
 * poster still is the same composition the canvas renders, so a visitor on
 * a locked-down hospital laptop gets a complete, fast page rather than a
 * spinner. That visitor is the buyer who matters most.
 *
 * Returns null while undetermined (server render and first paint), so
 * callers can avoid mounting anything until the check has actually run.
 */
export function useCanRender3D(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Respect the user before the hardware. prefers-reduced-motion is a
    // medical consideration here, not a stylistic one — see
    // docs/03-3d-production-spec.md.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOk(false);
      return;
    }

    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
        deviceMemory?: number;
      }
    ).connection;

    if (conn?.saveData) {
      setOk(false);
      return;
    }
    if (conn?.effectiveType && /^(slow-)?2g$/.test(conn.effectiveType)) {
      setOk(false);
      return;
    }

    // deviceMemory is Chromium-only; absent means "unknown", not "low".
    const mem = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    if (typeof mem === 'number' && mem < 4) {
      setOk(false);
      return;
    }

    // Probe WebGL2 without retaining the context — holding one here would
    // count against the browser's small per-page context budget.
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) {
        setOk(false);
        return;
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setOk(false);
      return;
    }

    setOk(true);
  }, []);

  return ok;
}

/** Only mount heavy content once it is actually about to be seen. */
export function useNearViewport<T extends Element>(rootMargin = '200px') {
  const [near, setNear] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  useEffect(() => {
    if (!node || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, near, rootMargin]);

  return { ref: setNode, near };
}

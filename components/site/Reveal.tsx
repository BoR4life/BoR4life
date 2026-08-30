'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll-triggered reveal.
 *
 * Two rules this is built around, both easy to get wrong:
 *
 *  1. Content is visible by default. The hidden state is applied by JS only
 *     after mount, so with JavaScript disabled — or if this component ever
 *     throws — the page reads completely rather than rendering blank. A
 *     reveal that gates visibility is a content-loss bug wearing an
 *     animation costume.
 *
 *  2. prefers-reduced-motion skips the animation entirely rather than
 *     shortening it. For this audience that is a medical consideration, not
 *     a stylistic one (docs/03-3d-production-spec.md).
 *
 * The motion itself is deliberately small: 12px and an opacity fade. Larger
 * travel reads as decoration and competes with the content.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Arm only once JS is running, so the default server-rendered state is
    // fully visible.
    setArmed(true);

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    // Failsafe. Once JS has armed the hidden state, anything the observer
    // never reports on would stay invisible permanently — an unusual
    // overflow container, a detached subtree, or a headless renderer that
    // captures without scrolling. Content is not allowed to depend on an
    // animation firing, so reveal unconditionally after a short delay.
    const failsafe = window.setTimeout(() => setShown(true), 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-reveal ${
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
      style={{ transitionDelay: hidden ? '0ms' : `${delay}ms` }}
    >
      {children}
    </div>
  );
}

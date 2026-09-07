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
 *
 * The stagger is a `step` index rather than a millisecond value, for two
 * reasons. The delay used to be applied with an inline `style` prop, which
 * Next.js server-renders as a `style="..."` attribute — and a strict
 * `style-src` refuses those, because a CSP nonce cannot be attached to a
 * style attribute. So every reveal on the page was silently unstyled until
 * hydration. Static utility classes are applied by the stylesheet and are
 * therefore correct at first paint, which is the whole point. Fixing it this
 * way also removed the arbitrary 60/80/90/100/120ms values that had
 * accumulated across call sites; one rhythm reads as deliberate.
 */

/**
 * Written out in full so Tailwind's scanner can see each class literally —
 * a computed `delay-[${n}ms]` produces no CSS at all, and would fail
 * silently in exactly the same way the inline styles did.
 */
const STEP_DELAY = [
  'delay-0',
  'delay-[90ms]',
  'delay-[180ms]',
  'delay-[270ms]',
  'delay-[360ms]',
  'delay-[450ms]',
] as const;

export function Reveal({
  children,
  step = 0,
  className = '',
}: {
  children: ReactNode;
  /** Stagger position, 0-5. Clamped — a longer list should not crawl in. */
  step?: number;
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
  // Delay only on the way in. Applying it while hidden would postpone the
  // hide as well, which shows a flash of the final state first.
  const delayClass = hidden
    ? 'delay-0'
    : STEP_DELAY[Math.min(Math.max(step, 0), STEP_DELAY.length - 1)];

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-reveal ${delayClass} ${
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}

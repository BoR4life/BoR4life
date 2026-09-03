'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV_LINKS, CTA } from '@/lib/nav';

/**
 * Site header.
 *
 * The mobile menu is plain conditional rendering rather than a CSS
 * transform, so it is genuinely absent from the accessibility tree when
 * closed — a visually-hidden-but-focusable menu is one of the most common
 * keyboard traps on marketing sites.
 *
 * MOTION
 *
 * The header condenses once the page has scrolled past its own height. It
 * is the one piece of chrome present on every page, so it is the cheapest
 * place to signal that the site was built rather than assembled — and it
 * earns its keep functionally too, giving back a few pixels of reading
 * height on a laptop.
 *
 * Three things make it safe rather than decorative:
 *
 *  - `prefers-reduced-motion` skips it entirely. Not "runs faster" —
 *    never arms. A header that resizes as you scroll is exactly the kind
 *    of motion someone with a vestibular condition has asked not to see,
 *    and the global transition-killer in globals.css would otherwise make
 *    it snap between sizes, which is worse than either alternative.
 *  - the scroll handler is passive and coalesced into a single
 *    requestAnimationFrame, so it cannot become a scroll-jank source. A
 *    header that costs frames to animate is a net loss.
 *  - only padding and the border change. Nothing reflows the page below,
 *    so there is no layout shift and no CLS cost.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let queued = false;
    const read = () => {
      queued = false;
      setCondensed(window.scrollY > 72);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Nav links grow a signal-coloured rule from the left on hover AND on
   * keyboard focus. The focus-visible half is the part usually forgotten:
   * a hover-only affordance tells a mouse user where they are and leaves a
   * keyboard user with nothing but the browser's default ring.
   *
   * `after:origin-left` with a scale transform is used rather than animating
   * width, because transforms are composited and width is not — this runs
   * on the GPU and cannot cause a layout pass.
   */
  const linkClass = (href: string) => {
    const active = pathname === href;
    return [
      'relative text-sm transition-colors',
      'after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:bg-signal',
      'after:origin-left after:transition-transform after:duration-300 after:ease-reveal',
      active
        ? 'text-paper-0 after:scale-x-100'
        : 'text-ink-300 after:scale-x-0 hover:text-paper-100 hover:after:scale-x-100 focus-visible:text-paper-100 focus-visible:after:scale-x-100',
    ].join(' ');
  };

  return (
    <header
      className={[
        'sticky top-0 z-40 border-b backdrop-blur',
        'transition-[padding,border-color,background-color] duration-300 ease-reveal',
        // Opacity is part of the condense, not decoration. At rest the header
        // sits over the top of the hero, which is flat ink-900, so
        // translucency costs nothing. Once the page scrolls, display type
        // passes underneath it — and at 85% a 5.75rem headline bleeds through
        // as a muddy band. Nearly opaque when condensed, which is when it
        // actually has something behind it.
        condensed
          ? 'border-ink-700 bg-ink-900/95 py-1'
          : 'border-ink-700/60 bg-ink-900/80 py-0',
      ].join(' ')}
    >
      <div
        className={[
          'mx-auto flex max-w-content items-center justify-between px-6 md:px-16',
          'transition-[padding] duration-300 ease-reveal',
          condensed ? 'py-2.5' : 'py-4',
        ].join(' ')}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-[-0.01em] text-paper-0"
          aria-label="Bundle of Rays — home"
        >
          Bundle of Rays
        </Link>

        <nav
          aria-label="Main"
          // Five links plus the CTA is the most this row can hold. The tighter
          // gap keeps it on one line at exactly 768px, where an extra nav
          // item would otherwise wrap the CTA under the wordmark.
          className="hidden items-center gap-6 md:flex lg:gap-8"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={CTA.href}
            // group/active:scale gives a real press. A button that does not
            // acknowledge the click leaves people tapping it twice.
            className="group rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink-900 transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.97]"
          >
            {CTA.label}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          // Negative margin cancels the padding visually, so the button
          // stays where it was designed to sit while presenting a target a
          // thumb can actually hit. Text alone is ~20px tall, under the 24px
          // floor in WCAG 2.2 SC 2.5.8.
          className="-m-2 p-2 text-sm text-paper-100 transition-opacity active:opacity-70 md:hidden"
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-ink-700/60 px-6 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={linkClass(link.href)}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={CTA.href}
                onClick={() => setOpen(false)}
                className="inline-block rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink-900 transition-transform active:scale-[0.97]"
              >
                {CTA.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

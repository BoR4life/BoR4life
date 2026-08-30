'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_LINKS, CTA } from '@/lib/nav';

/**
 * Site header.
 *
 * The mobile menu is plain conditional rendering rather than a CSS
 * transform, so it is genuinely absent from the accessibility tree when
 * closed — a visually-hidden-but-focusable menu is one of the most common
 * keyboard traps on marketing sites.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = pathname === href;
    return [
      'text-sm transition-colors',
      active ? 'text-paper-0' : 'text-ink-300 hover:text-paper-100',
    ].join(' ');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/60 bg-ink-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4 md:px-16">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[-0.01em] text-paper-0"
          aria-label="Bundle of Rays — home"
        >
          Bundle of Rays
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
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
            className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink-900 transition-opacity hover:opacity-90"
          >
            {CTA.label}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="text-sm text-paper-100 md:hidden"
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
                className="inline-block rounded-full bg-signal px-4 py-2 text-sm font-semibold text-ink-900"
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

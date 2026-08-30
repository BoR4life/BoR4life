import Link from 'next/link';
import { NAV_LINKS, LEGAL_LINKS, CTA } from '@/lib/nav';
import { SOCIAL_LINKS } from '@/lib/social';

export function Footer() {
  return (
    <footer className="border-t border-ink-700 bg-ink-900 px-6 py-16 md:px-16">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-paper-0">
              Bundle of Rays
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              Clinically authored immersive training for healthcare. Built by
              nurses, for nurses.
            </p>
            <p className="mt-4 text-sm text-ink-300">
              Buderim, Queensland, Australia
            </p>
          </div>

          <div className="flex gap-16">
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-3">
                {[...NAV_LINKS, CTA].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-300 transition-colors hover:text-paper-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social">
              <ul className="flex flex-col gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      // noopener/noreferrer on every external target: without
                      // them the opened page can reach back via window.opener.
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-300 transition-colors hover:text-paper-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ink-700 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-ink-300">
            © {new Date().getFullYear()} Bundle of Rays. Operating across
            Australia, the UK, the USA, Sri Lanka, South Korea and India.
          </p>

          {/* Procurement and ethics reviewers look for these in the footer
              and nowhere else, so they sit on the baseline of every page
              rather than in the header. */}
          <nav aria-label="Legal">
            <ul className="flex gap-6">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-ink-300 transition-colors hover:text-paper-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

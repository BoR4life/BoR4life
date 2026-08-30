/**
 * Site navigation. Order follows docs/02-content-architecture.md.
 *
 * Deliberately short: /evidence and /contact are the two links that close
 * institutional deals, so they are not buried behind a "Company" dropdown.
 * Solutions, case studies and resources come back once those pages exist —
 * shipping empty nav items that 404 is worse than a shorter menu.
 */
export const NAV_LINKS = [
  { href: '/platform', label: 'Platform' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/evidence', label: 'Evidence' },
  { href: '/about', label: 'About' },
] as const;

export const CTA = { href: '/contact', label: 'Book a demo' } as const;

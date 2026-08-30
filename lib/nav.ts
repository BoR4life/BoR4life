/**
 * Site navigation. Order follows docs/02-content-architecture.md.
 *
 * Deliberately short: /evidence and /contact are the two links that close
 * institutional deals, so they are not buried behind a "Company" dropdown.
 * Case studies come back once those pages exist — shipping empty nav items
 * that 404 is worse than a shorter menu.
 */
export const NAV_LINKS = [
  { href: '/platform', label: 'Platform' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/evidence', label: 'Evidence' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
] as const;

/**
 * Footer-only links. The privacy notice and accessibility statement are
 * exactly where a procurement or ethics reviewer looks for them — in the
 * footer — and putting them in the main nav would spend header space that
 * belongs to the sales argument. Kept separate from NAV_LINKS so the header
 * never renders them.
 */
export const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/accessibility', label: 'Accessibility' },
] as const;

export const CTA = { href: '/contact', label: 'Book a demo' } as const;

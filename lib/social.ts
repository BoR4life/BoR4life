/**
 * Public business profiles.
 *
 * Business accounts only — Brad's personal Facebook profile is deliberately
 * excluded. These also populate `sameAs` in the Organization structured
 * data, which is how search engines link the site to the same real-world
 * entity across the web; for a company whose name is easy to mis-attribute,
 * that is worth more than the footer links themselves.
 */
export const SOCIAL_LINKS = [
  {
    href: 'https://www.linkedin.com/in/xr-nursing',
    label: 'LinkedIn',
  },
  {
    href: 'https://www.instagram.com/bundleofrays/',
    label: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/bundleofrays/',
    label: 'Facebook',
  },
] as const;

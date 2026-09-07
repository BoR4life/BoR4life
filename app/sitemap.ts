import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';
import { SOLUTIONS } from '@/lib/solutions';

const BASE = siteUrl();

/*
 * /customers is deliberately absent. That page sets `robots: { index: false }`,
 * and listing a noindex page in a sitemap asks a crawler to fetch something it
 * is then told to discard — a contradiction Search Console reports back as an
 * error. If the page ever becomes public, remove its noindex first and add it
 * here second. tests/security.spec.ts holds the pair together.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/platform',
    '/solutions',
    ...SOLUTIONS.map((s) => `/solutions/${s.slug}`),
    '/evidence',
    '/resources',
    '/about',
    '/contact',
    '/privacy',
    '/accessibility',
  ];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}

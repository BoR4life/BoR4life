import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';
import { SOLUTIONS } from '@/lib/solutions';

const BASE = siteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/platform',
    '/solutions',
    ...SOLUTIONS.map((s) => `/solutions/${s.slug}`),
    '/evidence',
    '/about',
    '/contact',
  ];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}

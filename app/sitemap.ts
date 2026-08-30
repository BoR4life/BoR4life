import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';

const BASE = siteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/platform', '/evidence', '/about', '/contact'];
  return routes.map((route) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}

import type { Metadata } from 'next';

/**
 * Per-page metadata, in one place.
 *
 * Two real defects made this necessary, both found by reading the rendered
 * HTML rather than the config:
 *
 * 1. NO PAGE HAD A CANONICAL URL. Next.js does not emit one unless you ask.
 *    That matters here more than on most sites, because this one will be
 *    reachable at the apex, at www, and at a vercel.app preview domain —
 *    three addresses serving identical content, with nothing telling a
 *    search engine which is the real one. Ranking signals split across
 *    whichever it happens to index.
 *
 * 2. EVERY PAGE SHARED THE HOMEPAGE'S OPEN GRAPH TITLE AND DESCRIPTION.
 *    Page titles were set correctly, but og:title and og:description fall
 *    back to the root layout unless overridden — so a link to /evidence
 *    posted on LinkedIn advertised the homepage's generic pitch instead of
 *    the evidence page. LinkedIn is this business's main channel, which
 *    made it the most expensive small bug on the site.
 *
 * Both are the kind of thing that looks fine in every browser and is only
 * visible in the source or in a share preview. Hence the helper: get it
 * right once, and a new page cannot be added without it.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  /** Route path with a leading slash. '/' for the homepage. */
  path: string;
  /** Optional page-specific share image, absolute path under /public. */
  image?: string;
}): Metadata {
  // The title template in app/layout.tsx appends the brand to `title`, but
  // Open Graph has no templating — so the suffix is added by hand here to
  // keep a share card and a browser tab saying the same thing.
  const shareTitle =
    path === '/' ? title : `${title} — Bundle of Rays`;

  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'Bundle of Rays',
      url: path,
      title: shareTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

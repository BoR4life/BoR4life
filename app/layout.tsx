import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { LeadSourceCapture } from '@/components/analytics/LeadSourceCapture';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { SOCIAL_LINKS } from '@/lib/social';
import { siteUrl } from '@/lib/site';
import './globals.css';

/**
 * Site-wide metadata. `metadataBase` is required for correct absolute
 * OG/Twitter image URLs — without it Next.js silently falls back to
 * localhost in production, which is a real and common misconfiguration.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'Bundle of Rays — Immersive learning for healthcare',
    template: '%s — Bundle of Rays',
  },
  description:
    'Clinically authored immersive training that measurably changes what practitioners do under pressure. Built by nurses, for nurses.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    siteName: 'Bundle of Rays',
    title: 'Bundle of Rays — Immersive learning for healthcare',
    description:
      'Clinically authored immersive training that measurably changes what practitioners do under pressure.',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Bundle of Rays — practise the moment before it counts.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bundle of Rays — Immersive learning for healthcare',
    description:
      'Clinically authored immersive training that measurably changes what practitioners do under pressure.',
    images: ['/images/og-default.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0c0f',
  colorScheme: 'dark light',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the nonce middleware.ts attached to this request, so Next.js's own
  // inline bootstrap script satisfies the strict CSP declared there instead
  // of needing 'unsafe-inline'.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bundle of Rays',
    url: siteUrl(),
    description:
      'Clinically authored immersive training for healthcare. Built by nurses, for nurses.',
    foundingDate: '2018',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buderim',
      addressRegion: 'QLD',
      addressCountry: 'AU',
    },
    // Deliberately no `founder.alumniOf`. The founder's PhD institution is
    // not named anywhere on this site; see docs/00-brand-brief.md. Structured
    // data is the easiest place to leak it by reflex, so the omission is
    // recorded here rather than left looking like an oversight.
    founder: { '@type': 'Person', name: 'Brad Chesham' },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased" data-nonce={nonce}>
        {/* Skip link: first focusable element on the page, per WCAG 2.4.1 */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-signal focus:px-4 focus:py-2 focus:text-ink-900"
        >
          Skip to content
        </a>
        {/* Nonce-carrying so it satisfies the strict CSP in middleware.ts. */}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <LeadSourceCapture />
        <PostHogProvider>
          <Header />
          {children}
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}

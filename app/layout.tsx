import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import './globals.css';

/**
 * Site-wide metadata. `metadataBase` is required for correct absolute
 * OG/Twitter image URLs — without it Next.js silently falls back to
 * localhost in production, which is a real and common misconfiguration.
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bundleofrays.com',
  ),
  title: {
    default: 'Bundle of Rays — Immersive learning for healthcare',
    template: '%s — Bundle of Rays',
  },
  description:
    'Clinically authored immersive training that measurably changes what practitioners do under pressure. Built by nurses, for nurses.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
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
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}

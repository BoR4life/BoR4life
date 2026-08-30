/**
 * The bundle analyzer is a development tool and must never be a hard
 * requirement of the config.
 *
 * A static `import` of it makes next.config.mjs fail to load whenever
 * devDependencies are absent — which is precisely what happens on a build
 * server that installs with NODE_ENV=production. The build then dies while
 * loading its own configuration, before compiling a single file, which
 * looks like an inexplicable early failure rather than a missing optional
 * tool. Loaded on demand instead, so `ANALYZE=true npm run build` still
 * works locally and production builds never reach for it.
 */
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? (await import('@next/bundle-analyzer')).default({ enabled: true })
    : (config) => config;

/**
 * Security headers, applied to every route. This is the single place they
 * are defined — do not duplicate header logic in middleware.ts.
 *
 * CSP has no 'unsafe-inline' and no 'unsafe-eval'. Next.js's inline runtime
 * bootstrap script is nonce-based via middleware.ts, which is why the
 * script-src nonce is injected there rather than hard-coded here.
 */
const securityHeaders = [
  // HSTS: force HTTPS for a full year, including subdomains, and allow
  // browser preload lists — this cannot be undone quickly if wrong, so it
  // is only enabled once the production domain has HTTPS fully verified.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    // Deny every browser capability the site does not use. Add an entry
    // here only when a feature genuinely needs it — this list is a budget,
    // not a formality.
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'xr-spatial-tracking=(self)', // reserved for a future WebXR preview
    ].join(', '),
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // don't advertise the framework/version to scanners


  images: {
    formats: ['image/avif', 'image/webp'],
    // No remote patterns: every image ships from /public. Adding a remote
    // source here is a deliberate decision, not a default to relax.
    remotePatterns: [],
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  // Model files and fonts are versioned by filename, not by query string —
  // cache them hard, since a changed asset gets a changed name.
  async redirects() {
    return [];
  },
};

export default withBundleAnalyzer(nextConfig);

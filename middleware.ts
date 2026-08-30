import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Per-request CSP nonce.
 *
 * A strict CSP (no 'unsafe-inline', no 'unsafe-eval') is the actual security
 * boundary against injected scripts — the header list in next.config.mjs
 * covers everything else, but CSP has to be per-request because the nonce
 * must be unpredictable and single-use. Next.js reads this nonce via
 * headers() in app/layout.tsx and stamps it onto its own inline bootstrap
 * script, which is the one legitimate inline script the policy allows.
 *
 * connect-src is scoped to 'self' only — this site calls no third-party
 * APIs from the browser. Widen it deliberately if that ever changes, never
 * as a quick fix for a blocked request.
 */
export function middleware(request: NextRequest) {
  // Web Crypto + btoa, NOT Buffer. Middleware runs in the Edge Runtime,
  // where Node's Buffer does not exist — it is provided by the local dev
  // sandbox, so `Buffer.from(...)` builds and runs fine on a laptop and
  // then fails once deployed to the edge. Sixteen random bytes is also a
  // stronger nonce than base64-encoding a UUID string.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `media-src 'self'`,
    `worker-src 'self' blob:`, // three.js/R3F workers
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and image optimization, which
    // don't render HTML and don't need a nonce.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|glb|gltf|woff2?)$).*)',
  ],
};

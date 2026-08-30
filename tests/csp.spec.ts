import { test, expect } from '@playwright/test';

/**
 * CSP is the site's real defence against injected scripts, so it gets a
 * test rather than a manual curl. This also guards the Edge Runtime
 * mistake that broke deployment: middleware ran `Buffer.from(...)`, which
 * exists in the local dev sandbox but not on the edge, so the nonce
 * generation built and passed locally and failed once deployed.
 */

test('CSP is strict and the nonce rotates per request', async ({ request }) => {
  const first = await request.get('/');
  const second = await request.get('/');

  const csp = first.headers()['content-security-policy'] ?? '';
  expect(csp).toBeTruthy();

  // The whole point: no escape hatches.
  expect(csp).not.toContain("'unsafe-inline'");
  expect(csp).not.toContain("'unsafe-eval'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("connect-src 'self' blob:");
  // No remote host may appear in connect-src on the served policy.
  expect(csp).not.toMatch(/connect-src[^;]*https?:\/\//);

  const nonceOf = (h: string) => h.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];
  const a = nonceOf(csp);
  const b = nonceOf(second.headers()['content-security-policy'] ?? '');

  expect(a).toBeTruthy();
  expect(b).toBeTruthy();
  expect(a).not.toEqual(b); // must be single-use, never static
});

test('every script tag in the served HTML carries the nonce', async ({
  request,
}) => {
  const res = await request.get('/');
  const csp = res.headers()['content-security-policy'] ?? '';
  const nonce = csp.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];
  expect(nonce).toBeTruthy();

  const html = await res.text();
  const tags = html.match(/<script\b[^>]*>/g) ?? [];
  expect(tags.length).toBeGreaterThan(0);

  // Asserted against the raw HTML, not the DOM. Browsers deliberately hide
  // the nonce attribute from getAttribute() so it cannot be exfiltrated via
  // a CSS attribute selector — reading it back from the live document
  // always looks empty and would make this test silently meaningless.
  const missing = tags.filter((t) => !t.includes(`nonce="${nonce}"`));
  expect(missing).toEqual([]);
});

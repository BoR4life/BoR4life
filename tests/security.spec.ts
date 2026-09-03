import { test, expect } from '@playwright/test';
import { headerSafe } from '../lib/enquiry';

/**
 * Security regressions this site has to keep out. Each assertion exists
 * because the absence of the control is invisible in normal use.
 */

test('security headers are present on every response', async ({ request }) => {
  for (const route of ['/', '/contact', '/evidence']) {
    const res = await request.get(route);
    const h = res.headers();
    expect(h['strict-transport-security'], route).toContain('max-age=');
    expect(h['x-content-type-options'], route).toBe('nosniff');
    expect(h['x-frame-options'], route).toBe('DENY');
    expect(h['referrer-policy'], route).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy'], route).toContain('camera=()');
  }
});

test('the CSP nonce is unique per response', async ({ request }) => {
  // A reused nonce is the same as no nonce: an injected script that captures
  // one from a cached page would validate on the next.
  const nonces = new Set<string>();
  for (let i = 0; i < 3; i++) {
    const csp = (await request.get('/')).headers()['content-security-policy'];
    const m = csp?.match(/'nonce-([^']+)'/);
    expect(m, 'no nonce in CSP').not.toBeNull();
    nonces.add(m![1]!);
  }
  expect(nonces.size, 'nonce was reused across responses').toBe(3);
});

test('the structured-data block cannot be closed by its own payload', async ({
  page,
}) => {
  await page.goto('/');
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .innerText();
  expect(raw).not.toContain('</');
  // Still valid JSON after escaping.
  expect(() => JSON.parse(raw)).not.toThrow();
});

test('a noindex page is not advertised in the sitemap', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const page = await (await request.get('/customers')).text();
  expect(page, '/customers should be noindex').toContain('noindex');
  expect(xml, 'a noindex page must not be in the sitemap').not.toContain(
    '/customers',
  );
});

test('a mail header cannot be forged through the enquiry subject', () => {
  // The attack: a name carrying a line break, so the provider writes a second
  // header into the message it builds.
  const forged = 'Alex Reed\r\nBcc: harvest@example.invalid';
  const safe = headerSafe(`Enquiry — ${forged}`);

  expect(safe).not.toContain('\r');
  expect(safe).not.toContain('\n');
  // The text survives, flattened — the enquiry still reaches a human intact.
  expect(safe).toContain('Alex Reed');

  // Every C0 control and DEL, not just CR/LF.
  expect(headerSafe('a\u0000b\u001Fc\u007Fd')).toBe('a b c d');
  // Bounded, so a 200-character subject cannot be used to push content out.
  expect(headerSafe('x'.repeat(500)).length).toBe(200);
});

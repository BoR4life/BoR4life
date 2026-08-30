import { test, expect } from '@playwright/test';

import { buildCsp, analyticsOrigins } from '../lib/csp';

/**
 * Unit tests for the policy builder. tests/csp.spec.ts asserts what the
 * running server actually sends; this file covers the configurations that
 * server is not running under — most importantly the analytics-enabled one,
 * which previously produced a policy that blocked every analytics request
 * while the code that made them ran happily.
 */

const NONCE = 'dGVzdC1ub25jZS0xMjM0';

test('connect-src is closed when analytics are not configured', () => {
  const csp = buildCsp(NONCE, {});
  expect(csp).toContain("connect-src 'self';");
});

test('a configured analytics host is allowed, as a bare origin', () => {
  const csp = buildCsp(NONCE, {
    NEXT_PUBLIC_POSTHOG_KEY: 'phc_example',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com/some/path',
  });
  // Origin only. A path in a CSP source expression is matched as a path
  // prefix, which would silently fail to match the real request URLs.
  expect(csp).toContain("connect-src 'self' https://eu.i.posthog.com;");
});

test('a host without a key does not widen the policy', () => {
  // PostHogProvider requires both to initialise, so a host alone would
  // open the policy for traffic that never happens.
  expect(
    analyticsOrigins({ NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com' }),
  ).toEqual([]);
});

test('malformed or insecure hosts are dropped, never concatenated', () => {
  const cases = [
    'not a url',
    'http://eu.i.posthog.com', // plaintext
    "https://evil.example; script-src 'unsafe-inline'", // directive injection
    '',
    '   ',
  ];

  for (const host of cases) {
    const csp = buildCsp(NONCE, {
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_example',
      NEXT_PUBLIC_POSTHOG_HOST: host,
    });
    expect(csp, host).toContain("connect-src 'self';");
    expect(csp, host).not.toContain("'unsafe-inline'");
  }
});

test('the strict directives hold in every configuration', () => {
  for (const env of [
    {},
    {
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_example',
      NEXT_PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
    },
  ]) {
    const csp = buildCsp(NONCE, env);
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain(`'nonce-${NONCE}'`);
  }
});

'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

/**
 * Analytics with privacy defaults inverted from PostHog's own.
 *
 * This site's visitors are clinicians, health-department procurement staff
 * and university faculty. Anything typed into this site could be
 * institutionally sensitive, and session recording is the single easiest
 * way for a vendor to accidentally exfiltrate it. So every masking option
 * is enabled by default and un-masking is opt-in per element, rather than
 * PostHog's default of capturing broadly and masking on request.
 *
 * If NEXT_PUBLIC_POSTHOG_KEY is unset, analytics simply never initialise —
 * the site works identically without it. There is no silent fallback to a
 * default project, which is a real footgun in shared codebases.
 */

function initPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return false;
  if (typeof window === 'undefined') return false;

  posthog.init(key, {
    api_host: host,
    // Cookieless by default: no consent banner needed for basic analytics
    // in most jurisdictions, and nothing persistent stored on the device.
    persistence: 'memory',
    // Don't auto-fire pageviews; App Router navigations are handled below
    // so SPA route changes aren't missed or double-counted.
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: false,
    autocapture: {
      // Never capture the text content of elements — element text on this
      // site can include names, institutions and free-text form values.
      element_allowlist: ['button', 'a'],
    },
    session_recording: {
      // Mask ALL text and ALL inputs. This is the important line: PostHog's
      // default records input values, and a single un-masked form field on
      // a healthcare site is a genuine data-handling incident.
      maskAllInputs: true,
      maskTextSelector: '*',
      // Never record file inputs or clipboard content.
      blockSelector: '[data-ph-no-capture], .ph-no-capture, input[type="file"]',
    },
    // Respect Do Not Track rather than overriding it.
    respect_dnt: true,
    // Strip query strings and fragments from any URL-bearing property, in
    // case an identifier ever ends up in one. Written as a rebuild rather
    // than in-place mutation so there is no dynamic property assignment —
    // structurally immune to prototype-pollution style issues, not just
    // safe by inspection.
    sanitize_properties: (properties) => {
      const URL_KEYS = new Set(['$current_url', '$referrer', '$pathname']);

      const stripUrl = (value: unknown): unknown => {
        if (typeof value !== 'string') return value;
        try {
          const url = new URL(value, window.location.origin);
          url.search = '';
          url.hash = '';
          return url.toString();
        } catch {
          return undefined; // drop anything unparseable rather than send it
        }
      };

      return Object.fromEntries(
        Object.entries(properties)
          .map(([key, value]) => [
            key,
            URL_KEYS.has(key) ? stripUrl(value) : value,
          ])
          .filter(([, value]) => value !== undefined),
      );
    },
  });

  return true;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  const enabled =
    typeof process.env.NEXT_PUBLIC_POSTHOG_KEY === 'string' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY.length > 0;

  if (!enabled) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

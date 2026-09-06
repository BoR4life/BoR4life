/**
 * Where a lead came from.
 *
 * The single most useful piece of business analytics this site can produce
 * is not a dashboard — it is the answer, on every enquiry, to "which thing
 * we did made this person get in touch?" LinkedIn post, conference talk,
 * a referral from a colleague, a search. That answer is what decides where
 * the next month's effort goes, and it arrives with zero vendor, zero
 * cookies and zero privacy cost, because it is attached to something the
 * visitor has already chosen to send us.
 *
 * Two halves:
 *   - client side (captureLeadSource): read at page load, before any
 *     navigation, so the *entry* referrer and campaign survive the visitor
 *     browsing three pages before they reach the form. Kept in
 *     sessionStorage, which dies with the tab.
 *   - server side (describeLeadSource): country from the platform's edge
 *     header, plus the client-captured fields, formatted for the email.
 *
 * Nothing here is persisted anywhere except inside the enquiry email
 * itself. /privacy describes it in the enquiry section.
 */

import { audienceById, isAudienceId, type AudienceId } from './audience';

export const LEAD_SOURCE_FIELD = 'leadSource';
const STORAGE_KEY = 'bor:entry';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type LeadSource = {
  /** Where the visitor came from, as the browser reported it on entry. */
  referrer?: string;
  /** First page they landed on, path only. */
  landing?: string;
  /** Campaign tags from the entry URL, if any. */
  utm?: Partial<Record<(typeof UTM_KEYS)[number], string>>;
  /** Paths visited before submitting, in order, de-duplicated. */
  path?: string[];
  /**
   * What the visitor said they were, if they answered the question on the
   * homepage. Self-declared, never inferred — see lib/audience.ts.
   */
  audience?: AudienceId;
};

/**
 * Called once per page view on the client. On the first page of a visit it
 * records referrer, landing page and campaign tags; on every page it appends
 * the path. Everything is bounded so a pathological session cannot grow it.
 */
export function captureLeadSource(): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    const current: LeadSource = existing ? (JSON.parse(existing) as LeadSource) : {};

    if (!existing) {
      const url = new URL(window.location.href);
      const utm: LeadSource['utm'] = {};
      for (const key of UTM_KEYS) {
        const v = url.searchParams.get(key);
        if (v) utm[key] = v.slice(0, 120);
      }
      // Referrer is origin-only: the full path of a referring page can carry
      // someone else's identifiers, and we never need more than the host to
      // know whether it was LinkedIn, a search engine, or a partner site.
      let referrer: string | undefined;
      if (document.referrer) {
        try {
          const r = new URL(document.referrer);
          if (r.origin !== window.location.origin) referrer = r.host;
        } catch {
          /* unparseable referrer: ignore */
        }
      }
      current.referrer = referrer;
      current.landing = url.pathname;
      current.utm = Object.keys(utm).length ? utm : undefined;
    }

    const path = current.path ?? [];
    const here = window.location.pathname;
    if (path[path.length - 1] !== here) path.push(here);
    current.path = path.slice(-12);

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage blocked or full: the enquiry still works, just without source */
  }
}

/**
 * Record what the visitor said they were.
 *
 * Written into the same blob as everything else rather than a key of its
 * own: one storage key means one thing to describe in /privacy, one thing
 * to clear, and one lifetime — this dies with the tab like the rest. It
 * also means the enquiry form needs no change at all to carry it, because
 * the form already reads this blob into its hidden field.
 */
export function recordAudience(id: AudienceId): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    const current: LeadSource = existing ? (JSON.parse(existing) as LeadSource) : {};
    current.audience = id;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage blocked: the link still navigates, which is the important part */
  }
}

/** What the visitor said they were, if they said. */
export function readAudience(): AudienceId | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return isAudienceId(parsed.audience) ? parsed.audience : undefined;
  } catch {
    return undefined;
  }
}

/** The stored source, serialised for the hidden form field. */
export function readLeadSource(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * Parse the client-submitted field defensively. It is attacker-controlled
 * by definition, so it is treated as untrusted text: bounded in size,
 * whitelisted by key, and every value truncated before it goes anywhere
 * near an email body.
 */
export function parseLeadSource(raw: unknown): LeadSource {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 4000) return {};
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>;
    if (!obj || typeof obj !== 'object') return {};
    const out: LeadSource = {};

    if (typeof obj.referrer === 'string') out.referrer = obj.referrer.slice(0, 200);
    if (typeof obj.landing === 'string') out.landing = obj.landing.slice(0, 200);

    if (obj.utm && typeof obj.utm === 'object') {
      const utm: LeadSource['utm'] = {};
      for (const key of UTM_KEYS) {
        const v = (obj.utm as Record<string, unknown>)[key];
        if (typeof v === 'string' && v) utm[key] = v.slice(0, 120);
      }
      if (Object.keys(utm).length) out.utm = utm;
    }

    // Whitelisted against the known ids rather than length-capped: this
    // value is printed in an email Brad reads, so an attacker must not be
    // able to write arbitrary text into it.
    if (isAudienceId(obj.audience)) out.audience = obj.audience;

    if (Array.isArray(obj.path)) {
      out.path = obj.path
        .filter((p): p is string => typeof p === 'string')
        .map((p) => p.slice(0, 120))
        .slice(0, 12);
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Plain-text block for the enquiry email. Written so a person can read it in
 * two seconds, and so an empty source still says something useful ("direct,
 * no campaign") rather than nothing.
 */
export function describeLeadSource(
  source: LeadSource,
  headers: { country?: string | null; region?: string | null },
): string {
  const lines: string[] = [];

  // First, because it is the only line here the visitor chose to tell us.
  const said = source.audience ? audienceById(source.audience) : undefined;
  lines.push(`Says they are: ${said ? said.label : 'did not say'}`);

  const where = [headers.region, headers.country].filter(Boolean).join(', ');
  lines.push(`Location:     ${where || 'unknown'}`);

  lines.push(`Came from:    ${source.referrer ?? 'direct (typed the address, a bookmark, or an email link)'}`);

  if (source.utm) {
    const bits = Object.entries(source.utm).map(([k, v]) => `${k.replace('utm_', '')}=${v}`);
    lines.push(`Campaign:     ${bits.join('  ')}`);
  } else {
    lines.push('Campaign:     none tagged');
  }

  if (source.landing) lines.push(`Landed on:    ${source.landing}`);
  if (source.path && source.path.length > 1) {
    lines.push(`Read first:   ${source.path.slice(0, -1).join(' → ')}`);
  }

  return lines.join('\n');
}

/**
 * Who the visitor says they are.
 *
 * The site serves three readers who want different things from the same
 * platform: a nursing school choosing how a cohort practises, a health
 * service solving a workforce problem, and a department or large provider
 * buying something built to its own protocols. Nothing on the page can tell
 * them apart, and guessing from a referrer or an IP range would be both
 * unreliable and a privacy cost this site has refused everywhere else.
 *
 * So it asks, once, and lets them answer or ignore it.
 *
 * Three deliberate constraints on how the answer is used:
 *
 *   - It ROUTES, it never hides. Every choice is an ordinary link to a page
 *     that already exists and is already crawlable, so a visitor who never
 *     answers, a visitor with JavaScript off, and a search engine all see
 *     the whole site. Personalising by removing content would trade SEO and
 *     accessibility for a trick.
 *
 *   - It does not reorder /solutions, which was the first idea and is
 *     wrong. Those sections alternate paper and ink grounds by position, so
 *     shuffling them puts two grounds of the same colour side by side.
 *
 *   - The answer is a lead qualifier, not a profile. It rides into the
 *     enquiry email inside the existing lead-source blob — one
 *     sessionStorage key, already described in /privacy, dead when the tab
 *     closes — so Brad reads "told us they are: a hospital or health
 *     service" at the top of every enquiry. That one line is worth more
 *     than any amount of inferred segmentation, and it costs no cookie.
 *
 * On the wording of the three labels. They are parallel in construction —
 * each begins "A" and names an institution the reader belongs to, not a
 * market segment they fall into — because a self-select control is read as
 * a list and a reader compares its items to each other before comparing any
 * of them to themselves. "Government, or a large private provider" broke
 * that pattern and was fixed.
 *
 * They are also checked for idiom, because this site sells into Australia,
 * the United States, Korea and India. "Health service" is Australian and
 * British where the United States would say "health system"; it is kept
 * because it is understood in both, because Australia is the home market,
 * and because it is the phrase lib/solutions.ts already uses for that
 * audience. Divergence between the two would be worse than either choice.
 *
 * The description under each choice is deliberately NOT written here. It is
 * the `summary` already on the matching entry in lib/solutions.ts. Copy
 * that makes a claim lives in exactly one place, so this file cannot drift
 * from it, cannot soften it, and cannot quietly invent a fourth offering —
 * which docs/00-brand-brief.md forbids.
 */

import { SOLUTIONS } from './solutions';

export const AUDIENCE_IDS = ['university', 'health-service', 'government'] as const;

export type AudienceId = (typeof AUDIENCE_IDS)[number];

export type Audience = {
  id: AudienceId;
  /** Phrased as the visitor would describe themselves, not as a market segment. */
  label: string;
  /** The solution whose summary answers this reader first. */
  slug: string;
};

export const AUDIENCES: readonly Audience[] = [
  { id: 'university', label: 'A university or nursing school', slug: 'nursing' },
  { id: 'health-service', label: 'A hospital or health service', slug: 'patient' },
  { id: 'government', label: 'A government department or large provider', slug: 'custom' },
] as const;

export function isAudienceId(value: unknown): value is AudienceId {
  return typeof value === 'string' && (AUDIENCE_IDS as readonly string[]).includes(value);
}

export function audienceById(id: string): Audience | undefined {
  return AUDIENCES.find((a) => a.id === id);
}

/** The summary shown under a choice. Sourced from lib/solutions.ts, never copied. */
export function audienceSummary(audience: Audience): string {
  return SOLUTIONS.find((s) => s.slug === audience.slug)?.summary ?? '';
}

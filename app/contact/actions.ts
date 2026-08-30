'use server';

import { headers } from 'next/headers';
import { EnquirySchema, ROLE_LABELS } from '@/lib/enquiry';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Enquiry submission.
 *
 * A Server Action rather than a route handler: Next.js binds Server Actions
 * to an origin-checked POST with its own action ID, which removes the
 * classic CSRF surface a hand-rolled /api endpoint would have.
 *
 * Order:
 *   1. Rate limit (before parsing, so a flood costs almost nothing)
 *   2. Schema validation
 *   3. Honeypot + timing
 *   4. Delivery
 *
 * Validation deliberately runs BEFORE the bot checks. Putting the timing
 * gate first seemed cheaper, but it silently returned "success" to a human
 * who clicked submit on an empty form to see what was required — masking
 * real validation errors behind an anti-spam control. Bots submit
 * complete-looking data, so they still hit the honeypot and timing checks
 * on the next step; humans get the field errors they need. Caught by
 * tests/enquiry.spec.ts.
 *
 * Bots are answered with the same success response a human gets. Telling a
 * spammer their submission was rejected just teaches them what to change.
 */

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

const MIN_FILL_MS = 2000;

async function clientKey(): Promise<string> {
  const h = await headers();
  // Trust order matters: on Vercel x-forwarded-for is set by the platform.
  // Behind a different proxy this must be re-checked, since a
  // client-supplied header would otherwise let anyone forge their identity
  // and bypass the limit entirely.
  const fwd = h.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return `enquiry:${ip}`;
}

/**
 * Delivery.
 *
 * Resend is the default provider: it is the simplest to operate, needs only
 * a verified sending domain, and its API is a single HTTPS POST — so no SDK
 * enters the client bundle and `connect-src 'self'` stays closed (this all
 * runs server-side).
 *
 * Two escape hatches are kept deliberately:
 *   - ENQUIRY_WEBHOOK_URL posts the raw enquiry anywhere (Zapier, a CRM,
 *     an internal endpoint) without touching this file.
 *   - Neither configured means enquiries are logged without PII, so the
 *     form is testable end to end before any provider exists.
 *
 * Data residency note: Resend processes in the US. For AU/UK/EU health
 * buyers that can matter in a procurement questionnaire. An enquiry form
 * carries only name, work email, organisation and a message — low
 * sensitivity — but if a buyer requires in-region processing, swap this
 * function for SES in ap-southeast-2 or Postmark EU. Nothing else changes.
 */
async function deliver(enquiry: {
  name: string;
  email: string;
  organisation?: string;
  role: keyof typeof ROLE_LABELS;
  message: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL;

  if (apiKey && to && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying goes straight back to the enquirer rather than to the
        // sending domain — the single detail that makes this usable daily.
        reply_to: enquiry.email,
        subject: `Enquiry — ${enquiry.name}${
          enquiry.organisation ? ` (${enquiry.organisation})` : ''
        }`,
        // Plain text only. No HTML means no injection surface in the mail
        // client, and the content is attacker-supplied by definition.
        text: [
          `Name:         ${enquiry.name}`,
          `Email:        ${enquiry.email}`,
          `Organisation: ${enquiry.organisation || '—'}`,
          `Role:         ${ROLE_LABELS[enquiry.role]}`,
          '',
          enquiry.message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return;
  }

  const endpoint = process.env.ENQUIRY_WEBHOOK_URL;

  if (!endpoint) {
    // No PII in logs — just enough to confirm the path works and to alert
    // if enquiries are arriving with no delivery configured.
    console.warn(
      `[enquiry] received (role=${enquiry.role}, org=${
        enquiry.organisation ? 'provided' : 'none'
      }) but no delivery is configured (set RESEND_API_KEY + ` +
        `ENQUIRY_TO_EMAIL + ENQUIRY_FROM_EMAIL, or ENQUIRY_WEBHOOK_URL) — not delivered.`,
    );
    return;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(enquiry),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Delivery failed with ${res.status}`);
  }
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // 1. Rate limit first — cheapest possible rejection.
  const limited = rateLimit(await clientKey(), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return {
      status: 'error',
      message: `Too many enquiries from this connection. Please try again in about ${Math.ceil(
        limited.retryAfterSec / 60,
      )} minutes, or email us directly.`,
    };
  }

  const raw = Object.fromEntries(formData);

  // 2. Validate first, so a real person always gets real feedback.
  const parsed = EnquirySchema.safeParse(raw);
  if (!parsed.success) {
    // Accumulate into a Map rather than a plain object. zod's issue paths
    // are schema-derived so they are not attacker-controlled today, but
    // assigning a computed key onto an object literal is a
    // prototype-pollution shape (`__proto__`, `constructor`) and there is
    // no reason to keep that shape when a Map has none.
    const collected = new Map<string, string>();
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !collected.has(key)) {
        collected.set(key, issue.message);
      }
    }
    const fieldErrors = Object.fromEntries(collected);
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors,
    };
  }

  // 3. Honeypot and timing, now that we know the submission is well-formed.
  //    Answer bots with success — never explain what gave them away.
  if (typeof raw.website === 'string' && raw.website.length > 0) {
    return { status: 'success' };
  }
  const startedAt = Number(raw.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) {
    return { status: 'success' };
  }

  // 4. Deliver.
  try {
    const { name, email, organisation, role, message } = parsed.data;
    await deliver({ name, email, organisation, role, message });
    return { status: 'success' };
  } catch {
    // Never surface the underlying error to the client — it can leak
    // provider details and endpoint shape.
    return {
      status: 'error',
      message:
        'Something went wrong sending your enquiry. Please email us directly and we will pick it up.',
    };
  }
}

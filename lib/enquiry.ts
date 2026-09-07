import { z } from 'zod';

/**
 * Enquiry payload. Validated server-side — client validation is a
 * convenience for the visitor, never a security boundary.
 *
 * Fields are deliberately minimal. Every extra field is more PII to hold
 * and justify, and this form only needs enough to reply.
 */
export const EnquirySchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(254), // RFC 5321 maximum
  organisation: z.string().trim().max(200).optional().or(z.literal('')),
  role: z.enum(
    ['procurement', 'academic', 'clinical-educator', 'other'],
    { message: 'Please choose the closest match' },
  ),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little about what you need')
    .max(4000),

  // Anti-spam. Both are hidden from real users.
  //   - website: a honeypot. Bots fill every field they find.
  //   - startedAt: form render time; a submit under ~2s is not a human.
  website: z.string().max(0).optional().or(z.literal('')),
  startedAt: z.coerce.number().int().nonnegative(),

  // Lead source. Free-form on purpose: it is client-reported and parsed
  // as untrusted text by lib/lead-source.ts, so validating its shape here
  // would only reject the enquiry of a real person whose browser sent
  // something odd. Bounded so it cannot be used as a payload.
  leadSource: z.string().max(4000).optional().or(z.literal('')),
});

export type Enquiry = z.infer<typeof EnquirySchema>;

export const ROLE_LABELS: Record<Enquiry['role'], string> = {
  procurement: 'Health service / government procurement',
  academic: 'University / academic decision-maker',
  'clinical-educator': 'Clinical educator',
  other: 'Something else',
};


/**
 * Strip anything that could break out of a mail header.
 *
 * The name and organisation are validated for length and then interpolated
 * into the enquiry Subject. They reach the mail provider as JSON, so nothing
 * can be injected at the HTTP layer — but the provider then writes that
 * string into a MIME header, and a newline inside it is the classic route to
 * forging a Bcc. Zod's .trim() strips surrounding whitespace, not interior
 * control characters, so a name containing a line break passes validation
 * completely intact.
 *
 * The provider very likely sanitises this itself. Relying on that is a guess
 * about someone else's implementation, and this costs one function.
 *
 * It lives here rather than beside its caller because a 'use server' module
 * may only export async functions, and a security control that cannot be
 * unit-tested is a security control nobody checks.
 */
export function headerSafe(value: string, max = 200): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

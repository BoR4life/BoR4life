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
});

export type Enquiry = z.infer<typeof EnquirySchema>;

export const ROLE_LABELS: Record<Enquiry['role'], string> = {
  procurement: 'Health service / government procurement',
  academic: 'University / academic decision-maker',
  'clinical-educator': 'Clinical educator',
  other: 'Something else',
};

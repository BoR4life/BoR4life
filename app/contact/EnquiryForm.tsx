'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitEnquiry, type EnquiryState } from './actions';
import { ROLE_LABELS } from '@/lib/enquiry';
import { LEAD_SOURCE_FIELD, readLeadSource } from '@/lib/lead-source';
import { trackEnquiry } from '@/components/analytics/PostHogProvider';

/**
 * Enquiry form.
 *
 * Recovering from an error, since this is a lead form and a lost message is
 * a lost customer: React 19 resets an uncontrolled form once its action
 * completes, so every field the visitor filled in is wiped even when the
 * action came back with errors. The action echoes the submitted values, and
 * the fields are keyed by attempt so React remounts them carrying those
 * values as their new defaults — the reset then restores what was typed
 * rather than emptying it. tests/form-recovery.spec.ts fails without this.
 *
 * Accessibility notes, since forms are where a11y usually fails:
 *  - every input has a real <label>, not a placeholder standing in for one
 *  - errors are tied to inputs via aria-describedby and aria-invalid
 *  - the status region is aria-live, so screen readers hear the outcome
 *    rather than only seeing a colour change
 *  - the honeypot is hidden with a class, NOT type="hidden" — bots skip
 *    hidden inputs but happily fill visually-hidden ones. It is also
 *    aria-hidden and tabindex=-1 so real keyboard users never reach it.
 *  - on a failed submit, focus moves to the first field in error. An
 *    aria-live announcement alone leaves a keyboard user standing at the
 *    submit button, hunting upward for what went wrong.
 */

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send enquiry'}
    </button>
  );
}

const field =
  'w-full rounded border border-rule bg-surface px-4 py-3 text-ink placeholder:text-muted focus:border-accent';
const labelCls = 'block text-sm font-medium text-ink';
const errCls = 'mt-1 text-sm text-critical';

export function EnquiryForm() {
  const [state, formAction] = useActionState<EnquiryState, FormData>(
    submitEnquiry,
    { status: 'idle' },
  );
  const [startedAt, setStartedAt] = useState('0');
  const [leadSource, setLeadSource] = useState('');
  const headingRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Bumped on every new result from the action. Used as the key on each
  // field: React discards the old input and mounts a new one carrying the
  // echoed value as its default, so the automatic post-action form reset
  // restores what was typed instead of clearing it.
  const seenRef = useRef<EnquiryState | null>(null);
  const attemptRef = useRef(0);
  if (seenRef.current !== state) {
    seenRef.current = state;
    attemptRef.current += 1;
  }
  const attempt = attemptRef.current;

  // Set on mount so the value reflects when the visitor actually saw the
  // form. Rendering it server-side would bake in build time and defeat the
  // timing check entirely.
  useEffect(() => {
    setStartedAt(String(Date.now()));
    // Where this visit came from, captured on entry by the layout and read
    // here so it travels with the enquiry. See lib/lead-source.ts.
    setLeadSource(readLeadSource());
  }, []);

  // Move focus to the confirmation so keyboard and screen-reader users are
  // not left at the bottom of a form that appears unchanged.
  const roleRef = useRef('');
  useEffect(() => {
    if (state.status === 'success') {
      headingRef.current?.focus();
      trackEnquiry(roleRef.current || 'unknown');
    }
  }, [state.status]);

  const err = state.status === 'error' ? state.fieldErrors : undefined;
  const describedBy = (name: string) =>
    err?.[name] ? `${name}-error` : undefined;

  // Take the visitor to the first thing they need to fix. Runs after the
  // remount above, so it focuses the new input rather than a discarded one.
  useEffect(() => {
    if (state.status !== 'error') return;
    const first = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    first?.focus();
  }, [state]);

  // What the visitor typed, handed back by the action. Empty on a first
  // visit, which is exactly the right default.
  const was = state.status === 'error' ? state.values : undefined;

  if (state.status === 'success') {
    return (
      <div
        className="rounded border border-accent/40 bg-surface p-8"
        role="status"
      >
        <p
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold text-ink"
        >
          Thank you — your enquiry is with us.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          We reply to every enquiry personally, usually within two business
          days.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6" noValidate>
      <div aria-live="polite" className="sr-only">
        {state.status === 'error' ? state.message : ''}
      </div>

      {state.status === 'error' && !err && (
        <p className="rounded border border-critical/40 bg-surface p-4 text-sm text-critical">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="name" className={labelCls}>
          Your name
        </label>
        <input
          key={`name-${attempt}`}
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={was?.name ?? ''}
          required
          aria-invalid={!!err?.name}
          aria-describedby={describedBy('name')}
          className={`${field} mt-2`}
        />
        {err?.name && (
          <p id="name-error" className={errCls}>
            {err.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>
          Work email
        </label>
        <input
          key={`email-${attempt}`}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={was?.email ?? ''}
          required
          aria-invalid={!!err?.email}
          aria-describedby={describedBy('email')}
          className={`${field} mt-2`}
        />
        {err?.email && (
          <p id="email-error" className={errCls}>
            {err.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="organisation" className={labelCls}>
          Organisation <span className="text-muted">(optional)</span>
        </label>
        <input
          key={`organisation-${attempt}`}
          id="organisation"
          name="organisation"
          autoComplete="organization"
          defaultValue={was?.organisation ?? ''}
          className={`${field} mt-2`}
        />
      </div>

      <div>
        <label htmlFor="role" className={labelCls}>
          What best describes you?
        </label>
        <select
          key={`role-${attempt}`}
          id="role"
          name="role"
          required
          defaultValue={was?.role ?? ''}
          onChange={(e) => {
            roleRef.current = e.currentTarget.value;
          }}
          aria-invalid={!!err?.role}
          aria-describedby={describedBy('role')}
          className={`${field} mt-2`}
        >
          <option value="" disabled>
            Choose one
          </option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {err?.role && (
          <p id="role-error" className={errCls}>
            {err.role}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          What are you looking to do?
        </label>
        <textarea
          key={`message-${attempt}`}
          id="message"
          name="message"
          rows={5}
          defaultValue={was?.message ?? ''}
          required
          aria-invalid={!!err?.message}
          aria-describedby={describedBy('message')}
          className={`${field} mt-2`}
        />
        {err?.message && (
          <p id="message-error" className={errCls}>
            {err.message}
          </p>
        )}
      </div>

      {/*
        Honeypot. Visually hidden rather than type="hidden" — bots skip
        hidden inputs but fill visually-hidden ones. aria-hidden and
        tabIndex={-1} keep real keyboard and screen-reader users away.
      */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name={LEAD_SOURCE_FIELD} value={leadSource} />

      <SubmitButton />

      <p className="text-xs leading-relaxed text-muted">
        We use your details only to reply to this enquiry. We do not sell or
        share them.
      </p>
    </form>
  );
}

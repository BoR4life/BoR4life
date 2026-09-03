'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AUDIENCES, audienceSummary, type AudienceId } from '@/lib/audience';
import { readAudience, recordAudience } from '@/lib/lead-source';

/**
 * The self-select control.
 *
 * Ordinary links, not radio buttons, and that is the whole design.
 *
 * A radio group would need JavaScript to do anything at all: with scripting
 * off the visitor could check a box and watch nothing happen, which is
 * worse than not offering the control. These are links to pages that
 * already exist, so the no-JS path is not a fallback — it IS the feature,
 * and the script only adds memory on top.
 *
 * What the script adds:
 *   - it records the choice, so the enquiry email says what the visitor
 *     said they were (see recordAudience in lib/lead-source.ts);
 *   - it marks the remembered choice when they come back to this page.
 *
 * Two things this does NOT do, on purpose:
 *   - read storage during render. The server has no sessionStorage, so a
 *     value read during render would make the first paint disagree with the
 *     markup React sent and hydration would tear. It is read in an effect.
 *   - change layout when the choice is marked. Only border and background
 *     move, plus a tick that occupies space the row already reserves, so
 *     marking a choice cannot shift the page after paint.
 *
 * The remembered state is not signalled by colour alone: it carries
 * aria-current, a visible tick, and text for a screen reader.
 */
export function AudienceSelect() {
  const [chosen, setChosen] = useState<AudienceId | undefined>(undefined);

  useEffect(() => setChosen(readAudience()), []);

  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-3">
      {AUDIENCES.map((audience) => {
        const isChosen = chosen === audience.id;
        return (
          <li key={audience.id}>
            <Link
              href={`/solutions/${audience.slug}`}
              onClick={() => recordAudience(audience.id)}
              aria-current={isChosen ? 'true' : undefined}
              className={`group flex h-full flex-col rounded border p-5 transition-colors ${
                isChosen
                  ? 'border-signal bg-ink-700'
                  : 'border-ink-700 hover:border-ink-500 hover:bg-ink-700/40'
              }`}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-[0.9375rem] font-semibold text-paper-0">
                  {audience.label}
                </span>
                <span
                  className={`shrink-0 text-signal ${isChosen ? '' : 'invisible'}`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </span>
              {isChosen ? <span className="sr-only">Your selection.</span> : null}

              <span className="mt-3 text-sm leading-relaxed text-ink-300">
                {audienceSummary(audience)}
              </span>

              <span className="mt-4 text-sm font-semibold text-signal">
                Read this first
                <span
                  className="ml-1 inline-block transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

'use client';

import { useState } from 'react';

/**
 * Click-to-load embed for a video hosted on someone else's platform.
 *
 * WHY IT IS NOT JUST AN <IFRAME>
 *
 * A normal YouTube embed contacts Google the moment the page loads — every
 * visitor's IP address, referring page and user agent, before they have
 * shown any interest in the video at all. On a site whose /privacy page
 * says the browser is permitted to reach "this website only", a bare embed
 * would make that sentence false for every single visitor.
 *
 * So nothing is requested from YouTube until someone presses play. Until
 * then this is our own markup on our own origin: no iframe, no script, no
 * cookie, no request. Pressing play is the visitor choosing to involve a
 * third party, which is a completely different thing from us involving one
 * on their behalf.
 *
 * Two further details carry weight:
 *   - youtube-nocookie.com, not youtube.com. It suppresses the tracking
 *     cookies YouTube would otherwise set for ad personalisation.
 *   - The facade shows what the video IS rather than a frame from it. A
 *     scraped thumbnail would be another Google request, and using one of
 *     our own renders behind a play button would imply the video shows our
 *     footage when it does not.
 *
 * lib/csp.ts widens frame-src to exactly this one host. Nothing else.
 */

export function VideoEmbed({
  videoId,
  title,
  source,
  summary,
}: {
  /** YouTube video id — the part after `?v=` or `youtu.be/`. */
  videoId: string;
  title: string;
  /** Who made it. Required: this is someone else's work and it is labelled. */
  source: string;
  summary: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure className="m-0">
      <div className="relative aspect-video w-full overflow-hidden rounded border border-ink-700 bg-ink-900">
        {playing ? (
          <iframe
            // autoplay=1 because the visitor has already pressed play once;
            // making them press a second time inside the iframe is the kind
            // of small rudeness that reads as a broken embed.
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex flex-col items-start justify-end gap-3 p-6 text-left transition-colors hover:bg-ink-700/40 md:p-8"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-signal text-ink-900 transition-transform group-hover:scale-105"
            >
              {/* Play glyph as SVG rather than a character: ▶ renders as an
                  emoji on some platforms and as a box on others. */}
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="block">
              <span className="block text-xs uppercase tracking-[0.12em] text-ink-300">
                {source}
              </span>
              <span className="mt-1 block max-w-2xl text-xl font-semibold leading-tight text-paper-0">
                {title}
              </span>
              <span className="mt-2 block text-sm text-ink-300">
                Play video — loads from YouTube
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-ink-300">
        {summary}{' '}
        <span className="text-ink-300">
          Nothing is requested from YouTube until you press play.
        </span>
      </figcaption>
    </figure>
  );
}

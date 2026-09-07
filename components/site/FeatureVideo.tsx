/**
 * A video someone sits and watches, as distinct from a loop that runs.
 *
 * ScenarioVideo and PlatformClip both autoplay a short muted loop, which is
 * right for six seconds of ambience and wrong for a forty-five second piece
 * with an audio track. This one never plays by itself.
 *
 * No client JavaScript at all. `poster` plus `controls` plus
 * `preload="none"` gets the whole behaviour from the browser: the poster
 * paints immediately, the native play button is keyboard-operable and
 * screen-reader labelled without help, and the 1.7MB of video is not
 * fetched until somebody actually asks for it. A hand-rolled player would
 * be more code and less accessible.
 *
 * Because nothing autoplays there is no prefers-reduced-motion case to
 * handle — motion only ever begins on a deliberate press.
 *
 * ON THE AUDIO. Measured, this file's RMS sits between -22 and -24dB for
 * its whole duration. Speech swings far wider than that between phrases, so
 * the track reads as continuous background music rather than narration.
 * That inference is from statistics, not from listening, and it matters:
 * if there IS speech carrying information, WCAG 1.2.2 requires captions and
 * this component needs a <track> before the video is conformant. The prop
 * exists for exactly that.
 *
 * `source` is required and rendered as its own line. The caption should
 * therefore NOT name the software as well: the first version did, and the
 * name appeared twice, four millimetres apart. Say what is happening in the
 * caption and let the source line say whose it is.
 */
export function FeatureVideo({
  stem,
  width,
  height,
  label,
  source,
  caption,
  captionsSrc,
}: {
  /**
   * Basename under /public/video, without codec suffix. The poster is
   * derived from it and lives beside the video — scripts/validate-assets.mjs
   * looks for it there, and a poster orphaned in /images fails the gate.
   */
  stem: string;
  width: number;
  height: number;
  /** What the video shows, for anyone who cannot see it. */
  label: string;
  /** Whose software is on screen. Rendered, not merely documented. */
  source: string;
  caption: string;
  /** A WebVTT track. Required if the audio carries speech — see above. */
  captionsSrc?: string;
}) {
  return (
    <figure className="overflow-hidden rounded border border-rule bg-surface">
      <video
        className="block w-full"
        width={width}
        height={height}
        poster={`/video/${stem}.webp`}
        controls
        preload="none"
        playsInline
        aria-label={label}
      >
        <source src={`/video/${stem}-h264.mp4`} type="video/mp4" />
        {captionsSrc ? (
          <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
        ) : null}
      </video>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule px-4 py-3 text-xs leading-relaxed text-muted">
        <span>{caption}</span>
        <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-muted">
          {source}
        </span>
      </figcaption>
    </figure>
  );
}

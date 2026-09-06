'use client';

import { useId, useEffect, useState } from 'react';

/**
 * What one scenario run records, and when — driven by the reader.
 *
 * /evidence claims that decision, communication and procedural data are
 * "captured as it happens, not reconstructed afterwards from memory". That
 * claim is entirely about TIME, and prose is a poor instrument for time.
 * A static timeline showed it; this lets a reader move through the run and
 * watch capture happen, which is the difference between being told a thing
 * and seeing it.
 *
 * It is also the site's one genuinely interactive element, and it earns
 * that by being information rather than decoration. The brand kit is
 * explicit that gradients and motion do not appear as ornament — "a
 * gradient must encode a scale or a progression". This encodes the
 * progression the page is arguing about.
 *
 * HOW IT BEHAVES WITHOUT JAVASCRIPT
 *
 * The full run renders on the server with every mark already recorded,
 * which is the complete and correct state: nothing is hidden behind the
 * interaction, and a reader who never touches the control — or a crawler —
 * sees the whole thing. The scrubber ships disabled and is enabled on
 * mount, so it is never an inert control that appears to work and does
 * not, and reserving its space means enabling it shifts nothing.
 *
 * ACCESSIBILITY
 *
 * The control is a native range input, so it is keyboard-operable by
 * arrows, Home and End for free, and announces its value. The count beside
 * it is an aria-live region, so a screen-reader user driving the slider
 * hears the number change rather than being told only a percentage. No
 * motion is animated, so there is nothing for prefers-reduced-motion to
 * suppress — direct manipulation is not animation.
 *
 * Colour is not the only channel: a mark that has been recorded is filled
 * and full size, one still ahead of the playhead is hollow and smaller.
 */

const LANES = [
  { label: 'Decisions', marks: [196, 268, 351, 448, 523, 617] },
  { label: 'Communication', marks: [172, 231, 296, 340, 409, 470, 545, 598, 655] },
  { label: 'Procedure', marks: [214, 283, 372, 431, 512, 589, 640] },
];

const TRACK_START = 160;
const TRACK_END = 690;
const LANE_Y = [104, 158, 212];
const TOTAL = LANES.reduce((n, l) => n + l.marks.length, 0);

export function RunTimeline() {
  const id = useId();
  // Starts at the end of the run: the whole timeline is the default state,
  // and the reader scrubs BACK into it rather than having to build it up.
  const [pct, setPct] = useState(100);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const head = TRACK_START + ((TRACK_END - TRACK_START) * pct) / 100;
  const recorded = LANES.reduce(
    (n, lane) => n + lane.marks.filter((x) => x <= head).length,
    0,
  );

  return (
    <figure className="mt-14">
      <svg
        viewBox="0 0 720 250"
        className="w-full"
        role="img"
        aria-label="A timeline of one scenario run. Three parallel lanes — decisions, communication and procedure — carry capture marks spread continuously from the moment the scenario begins to the debrief, rather than clustering at the end."
      >
        <line
          x1={TRACK_START}
          y1={56}
          x2={TRACK_END}
          y2={56}
          className="stroke-rule"
          strokeWidth={1}
        />
        <text x={TRACK_START} y={42} className="fill-muted font-sans text-[11px]">
          Scenario begins
        </text>
        <text x={TRACK_END} y={42} textAnchor="end" className="fill-muted font-sans text-[11px]">
          Debrief
        </text>

        {/* The playhead. Drawn behind the marks so it never sits on top of
            one and disguises whether it has been passed. */}
        <line
          x1={head}
          y1={64}
          x2={head}
          y2={232}
          className="stroke-accent"
          strokeWidth={1.5}
        />

        {LANES.map((lane, i) => {
          const y = LANE_Y[i] ?? 0;
          return (
            <g key={lane.label}>
              <text x={0} y={y + 4} className="fill-ink font-sans text-[13px]">
                {lane.label}
              </text>
              <line
                x1={TRACK_START}
                y1={y}
                x2={TRACK_END}
                y2={y}
                className="stroke-rule"
                strokeWidth={1}
              />
              {lane.marks.map((x) => {
                const done = x <= head;
                return (
                  <circle
                    key={x}
                    cx={x}
                    cy={y}
                    r={done ? 4 : 2.5}
                    className={done ? 'fill-accent' : 'fill-none stroke-rule'}
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          Move through the run
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pct}
          disabled={!ready}
          onChange={(e) => setPct(Number(e.target.value))}
          className="h-6 min-w-[16rem] flex-1 accent-accent"
        />
        <p aria-live="polite" className="tabular text-sm text-muted">
          {recorded} of {TOTAL} moments recorded
        </p>
      </div>

      <figcaption className="mt-6 max-w-prose text-sm leading-relaxed text-muted">
        Each mark is a moment the run recorded something — a choice taken or
        declined, a thing said and to whom, a step performed out of order.
        Move the control back through the scenario and they do not disappear
        in a block at the end: they thin out evenly, because the recording
        happens throughout. That is the whole difference between measuring
        what a learner did and asking them afterwards what they remember
        doing.
      </figcaption>
    </figure>
  );
}

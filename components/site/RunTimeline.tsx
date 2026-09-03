/**
 * What one scenario run records, and when.
 *
 * /evidence carried 439 words and no imagery at all — on the page a review
 * committee spends the most time on. Its central claim is that decision,
 * communication and procedural data are "captured as the learner works,
 * not reconstructed afterwards from memory", and that claim is entirely
 * about TIME. Prose is a poor instrument for time; a timeline is the right
 * one, and it is the difference between a reader taking the claim on trust
 * and seeing what it means.
 *
 * Drawn rather than photographed on purpose. A screenshot of a dashboard
 * would be a picture of a product we would then have to keep in sync, and
 * we do not have source-resolution captures. A diagram of a mechanism
 * stays true as long as the mechanism does.
 *
 * Built to the repo's constraints, none of which are incidental:
 *
 *   - Colour comes from Tailwind's fill-* and stroke-* utilities bound to
 *     the design tokens, so there is no hex here and this cannot drift from
 *     app/globals.css (CLAUDE.md rule 4).
 *   - No `style` attribute anywhere. SVG presentation attributes like
 *     `cx` and `r` are attributes, not inline styles, so the CSP's
 *     style-src is untouched (rule 3).
 *   - `viewBox` plus w-full and h-auto, so it scales without a media query
 *     and without a second asset for mobile.
 *   - Labels carry `font-sans` explicitly. The base rule in globals.css
 *     puts the display face on headings and interface elements, but an SVG
 *     <text> is neither, so it inherits the body serif and a diagram's
 *     labels come out set like prose. Caught by looking at it.
 *   - role="img" with a label, because the marks carry meaning that the
 *     three headings above do not: the headings say WHAT is measured, this
 *     says it happens continuously during the run. The figcaption states
 *     the same thing in words, so nothing here is available only to
 *     someone who can see it.
 */

/** x positions of capture marks along each lane, in viewBox units. */
const LANES = [
  {
    label: 'Decisions',
    marks: [196, 268, 351, 448, 523, 617],
  },
  {
    label: 'Communication',
    marks: [172, 231, 296, 340, 409, 470, 545, 598, 655],
  },
  {
    label: 'Procedure',
    marks: [214, 283, 372, 431, 512, 589, 640],
  },
];

const TRACK_START = 160;
const TRACK_END = 690;
const LANE_Y = [104, 158, 212];

export function RunTimeline() {
  return (
    <figure className="mt-14">
      <svg
        viewBox="0 0 720 250"
        className="w-full"
        role="img"
        aria-label="A timeline of one scenario run. Three parallel lanes — decisions, communication and procedure — each carry capture marks spread continuously from the moment the scenario begins to the debrief, rather than clustering at the end."
      >
        {/* Time axis. The two ends are the only labels a reader needs to
            orient: everything between them is the run itself. */}
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
              {lane.marks.map((x) => (
                <circle key={x} cx={x} cy={y} r={4} className="fill-accent" />
              ))}
            </g>
          );
        })}
      </svg>

      <figcaption className="mt-6 max-w-prose text-sm leading-relaxed text-muted">
        Each mark is a moment the run recorded something — a choice taken or
        declined, a thing said and to whom, a step performed out of order.
        They are spread across the scenario rather than gathered at the end,
        which is the whole difference between measuring what a learner did
        and asking them afterwards what they remember doing.
      </figcaption>
    </figure>
  );
}

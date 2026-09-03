import { cover, COVER_VIEWBOX } from '@/lib/cover';

/**
 * A generated cover for a named thing.
 *
 * Server-rendered: the artwork is a pure function of the title, so there is
 * nothing for the client to compute and no reason to ship the generator to
 * a browser. It costs no request, no image file and no decode.
 *
 * Decorative by construction. The title it is generated from is always
 * rendered as text beside it, so the cover carries no information a reader
 * would lose — which is why it is aria-hidden rather than given a label
 * that would make a screen reader announce a picture of nothing.
 */
export function Cover({ name, className = '' }: { name: string; className?: string }) {
  const { shapes } = cover(name);

  return (
    <svg
      viewBox={`0 0 ${COVER_VIEWBOX.width} ${COVER_VIEWBOX.height}`}
      className={`w-full bg-paper ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {shapes.map((s, i) => {
        const tone = s.accent ? 'accent' : 'rule';
        if (s.kind === 'line') {
          return (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              className={s.accent ? 'stroke-accent' : 'stroke-rule'}
              strokeWidth={s.accent ? 1.6 : 1}
            />
          );
        }
        if (s.kind === 'dot') {
          return (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              className={s.accent ? 'fill-accent' : 'fill-muted-weak'}
            />
          );
        }
        return (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            className={s.accent ? 'fill-accent' : 'fill-rule'}
            data-tone={tone}
          />
        );
      })}
    </svg>
  );
}

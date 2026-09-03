import type { ReactNode } from 'react';

/**
 * Section shell.
 *
 * Exists so page rhythm is a decision made once rather than re-improvised
 * per page. The homepage previously alternated grounds by hand and drifted;
 * this keeps spacing and colour switching consistent, which is most of what
 * separates a considered layout from a competent one.
 */

type Ground = 'paper' | 'surface';
type Size = 'sm' | 'md' | 'lg';

/*
  Both grounds are light now. The brand is ink on paper and its governing
  document defines no dark ground at all, so the site's old alternation
  between a dark section and a light one is gone: `paper` is the page, and
  `surface` is the raised white band used to separate one argument from the
  next.

  The kit does keep a dark device — the ink field — but it is explicitly
  for "anything whose job is recognition rather than information", carries
  "the wordmark or a headline, never both plus body copy", and says that if
  a layout needs body copy it is the wrong layout. Every section on this
  site carries body copy, so none of them qualifies, including the hero.
*/
const GROUND: Record<Ground, string> = {
  paper: 'bg-paper text-ink',
  surface: 'bg-surface text-ink',
};

const PAD: Record<Size, string> = {
  sm: 'py-16 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-36',
};

export function Section({
  children,
  ground = 'paper',
  size = 'md',
  bordered = true,
  labelledBy,
  className = '',
}: {
  children: ReactNode;
  ground?: Ground;
  size?: Size;
  bordered?: boolean;
  labelledBy?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={[
        GROUND[ground],
        PAD[size],
        bordered ? 'border-t border-rule' : '',
        'px-6 md:px-16',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto max-w-content">{children}</div>
    </section>
  );
}

/**
 * Small tracked label above a heading. Used consistently site-wide.
 *
 * It used to take a `ground` prop to pick a legible muted tone, because the
 * site alternated a dark ground with a light one. With both grounds light
 * the same muted token is correct on either, so the prop is gone rather
 * than kept as a parameter that changes nothing.
 */
export function Eyebrow({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <p
      id={id}
      className={[
        'text-xs uppercase tracking-[0.12em] font-label',
      ].join(' ')}
    >
      {children}
    </p>
  );
}

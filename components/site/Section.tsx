import type { ReactNode } from 'react';

/**
 * Section shell.
 *
 * Exists so page rhythm is a decision made once rather than re-improvised
 * per page. The homepage previously alternated grounds by hand and drifted;
 * this keeps spacing and colour switching consistent, which is most of what
 * separates a considered layout from a competent one.
 */

type Ground = 'ink' | 'paper';
type Size = 'sm' | 'md' | 'lg';

const GROUND: Record<Ground, string> = {
  ink: 'bg-ink-900 text-paper-100',
  paper: 'bg-paper-100 text-ink-900',
};

const PAD: Record<Size, string> = {
  sm: 'py-16 md:py-20',
  md: 'py-20 md:py-28',
  lg: 'py-24 md:py-36',
};

export function Section({
  children,
  ground = 'ink',
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
        bordered ? 'border-t border-ink-700' : '',
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

/** Small tracked label above a heading. Used consistently site-wide. */
export function Eyebrow({
  children,
  ground = 'ink',
  id,
}: {
  children: ReactNode;
  ground?: Ground;
  id?: string;
}) {
  return (
    <p
      id={id}
      className={[
        'text-xs uppercase tracking-[0.12em] font-label',
        ground === 'ink' ? 'text-ink-300' : 'text-ink-500',
      ].join(' ')}
    >
      {children}
    </p>
  );
}

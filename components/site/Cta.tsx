import Link from 'next/link';

/**
 * The primary call to action, in one place.
 *
 * It existed as a hand-rolled `<Link>` with the same six utility classes
 * copied into seven files, which is how a button ends up subtly different
 * on one page. More to the point: an affordance that has to be improved in
 * seven places gets improved in five.
 *
 * The motion is one idea — the arrow moves toward where the click goes.
 * That is a directional cue rather than decoration, which is the test the
 * Lovable piece's own "Key Considerations" sets: focus micro-interactions
 * on functional moments.
 *
 * Two details that are easy to get wrong:
 *
 *  - `group-focus-visible` alongside `group-hover`. A hover-only animation
 *    is invisible to a keyboard user, who gets the affordance a mouse user
 *    gets only if it is wired to focus as well.
 *  - the arrow is `aria-hidden`. It is a glyph, and a screen reader
 *    announcing "right arrow" after the label adds nothing.
 *
 * Reduced motion needs no branch here: the global rule in globals.css
 * collapses every transition duration, so this becomes a static button.
 */
export function Cta({
  href = '/contact',
  children = 'Request a demo',
  tone = 'accent',
  className = '',
}: {
  href?: string;
  children?: React.ReactNode;
  /** `accent` is the filled primary. `quiet` is the text-and-arrow variant. */
  tone?: 'accent' | 'quiet';
  className?: string;
}) {
  const base =
    'group inline-flex items-center gap-2 text-sm font-semibold transition-[transform,opacity,color] duration-200 active:scale-[0.98]';

  const tones = {
    accent: 'rounded-full bg-accent px-7 py-3.5 text-accent-ink hover:opacity-90',
    quiet:
      'text-accent underline-offset-4 hover:underline focus-visible:underline',
  } as const;

  return (
    <Link href={href} className={`${base} ${tones[tone]} ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-200 ease-reveal group-hover:translate-x-1 group-focus-visible:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

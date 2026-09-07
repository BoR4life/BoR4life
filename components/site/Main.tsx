import type { ReactNode } from 'react';

/**
 * The page's main landmark, and the skip link's destination.
 *
 * It exists as a component for one reason: `tabIndex={-1}`. Without it a
 * skip link scrolls the page but leaves focus on <body>, so the next Tab
 * starts again from the top of the document — the keyboard user is
 * returned to the navigation they just asked to skip. The link appears to
 * work and does nothing, which is worse than not having one, and no
 * automated checker reports it. This was the site's actual behaviour until
 * tests/skip-link.spec.ts caught it.
 *
 * The outline is suppressed here alone. A 2px rule drawn around the whole
 * viewport reads as a rendering fault rather than a focus indicator, and
 * the feedback a visitor needs — the page has jumped, and the next Tab
 * lands on the first link in the content — is already unmistakable. Every
 * other focusable element on the site keeps its indicator.
 */
export function Main({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={['focus:outline-none', className].filter(Boolean).join(' ')}
    >
      {children}
    </main>
  );
}

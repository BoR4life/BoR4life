import type { Metadata } from 'next';
import Link from 'next/link';

import { PolicyPage, type PolicySection } from '@/components/site/PolicyPage';

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'Our WCAG 2.2 AA conformance statement for this website: what is tested automatically, what is checked by hand, and what we have not yet done.',
};

/**
 * Accessibility statement.
 *
 * Public-sector and university buyers ask for this document by name, and
 * most vendor versions are a paragraph asserting compliance. This one
 * states the conformance claim, the evidence behind it, and — the part
 * that makes it credible — the limitations.
 *
 * Everything asserted here maps to something in the repository:
 *   - the automated gate            tests/a11y.spec.ts (axe, WCAG 2.2 AA)
 *   - zero-violations budget        budgets.json
 *   - contrast proven by maths      tests/contrast.spec.ts
 *   - reduced motion                tests/a11y.spec.ts, Reveal.tsx
 *   - works without JavaScript      components/site/Reveal.tsx
 *   - skip link and landmarks       app/layout.tsx
 *   - manual pass before release    .claude/skills/ship-check/SKILL.md
 *
 * The scope line is load-bearing and must not be quietly widened: this
 * statement covers THIS WEBSITE. The VR and XR products have different
 * input models, different assistive-technology support, and have not been
 * assessed against WCAG. Claiming otherwise would be the single most
 * damaging false statement this site could make to a health-department
 * buyer, because it is the one they would check.
 */

const UPDATED = '2026-09-02';

const SECTIONS: PolicySection[] = [
  {
    id: 'conformance',
    heading: 'Our conformance claim',
    body: (
      <>
        <p>
          This website aims to conform to{' '}
          <strong>
            Web Content Accessibility Guidelines (WCAG) 2.2, Level AA
          </strong>
          . We believe it currently meets that standard, and we test every page
          against it on every change rather than at launch and never again.
        </p>
        <p>
          This is a self-assessment. We have not yet commissioned an
          independent third-party audit, and we say so here rather than let the
          word &ldquo;compliant&rdquo; imply one.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    heading: 'What this statement covers',
    body: (
      <>
        <p>
          <strong>In scope:</strong> every page of this website.
        </p>
        <p>
          <strong>Not in scope:</strong> our VR and XR training products. Head
          mounted immersive software has a different input model, different
          assistive-technology support, and is not assessed against WCAG, which
          was written for web content. Where a deployment has accessibility
          requirements — and in public health services it usually does — we work
          through them with the institution as part of that project. Ask us and
          we will tell you exactly what a given product does and does not
          support today.
        </p>
      </>
    ),
  },
  {
    id: 'automated',
    heading: 'What is tested automatically',
    body: (
      <>
        <p>
          Every page is scanned against the WCAG 2.0, 2.1 and 2.2 A and AA
          rulesets on each change, and the build fails on a single violation.
          Not a warning — a failure. A page with an accessibility violation
          cannot be released.
        </p>
        <p>
          Colour contrast is verified separately, by calculating the contrast
          ratio of every colour pairing in the design system rather than
          spot-checking screenshots. That test exists because we shipped a
          contrast failure: a colour intended for borders was used for footer
          text at 1.9:1 across five pages. Eyeballing it had not caught it; the
          maths did.
        </p>
        <p>
          Automated tooling finds roughly forty per cent of real accessibility
          problems. It is a floor, not a proof, which is why the next section
          exists.
        </p>
      </>
    ),
  },
  {
    id: 'manual',
    heading: 'What is checked by hand',
    body: (
      <>
        <p>Before each release we work through the site:</p>
        <ul>
          <li>
            <strong>Keyboard only.</strong> Every interactive element reachable
            and operable with no mouse, in a sensible order, with a visible
            focus indicator and no keyboard traps.
          </li>
          <li>
            <strong>Reduced motion.</strong> With the operating system set to
            reduce motion, nothing animates: every element renders in its
            final position immediately. That is the intended design, not a
            degradation.
          </li>
          <li>
            <strong>Without JavaScript.</strong> All content is present and
            readable. Nothing on this site depends on an animation firing to
            become visible.
          </li>
          <li>
            <strong>Screen reader structure.</strong> One first-level heading
            per page, headings in order, real landmark regions, a skip link as
            the first focusable element, and meaningful alternative text on
            images that carry meaning.
          </li>
          <li>
            <strong>Zoom and reflow.</strong> Readable at 200% zoom and at 320
            pixels wide, without horizontal scrolling.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'motion',
    heading: 'Motion and photosensitivity',
    body: (
      <>
        <p>
          Motion on this site is limited to short fades as content comes into
          view, and to video that you start yourself:
        </p>
        <ul>
          <li>
            Nothing flashes, strobes, or changes more than three times per
            second.
          </li>
          <li>
            If you have asked your device to reduce motion, the fades do not
            run at all — every element is simply present.
          </li>
          <li>
            No video plays with sound until you press play, and nothing moves
            for longer than five seconds without a way to stop it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'limitations',
    heading: 'Known limitations',
    body: (
      <>
        <p>
          Stating these is the point of a real conformance statement:
        </p>
        <ul>
          <li>
            <strong>No independent audit yet.</strong> The claim above is
            ours, supported by our own testing.
          </li>
          <li>
            <strong>Not every assistive technology has been tested.</strong> We
            test the structure that assistive technology relies on, and we have
            not verified every screen reader and browser combination in use.
          </li>
          <li>
            <strong>Video captions.</strong> Where scenario footage is used as
            background texture it carries no spoken content and is marked as
            decorative. Any video we publish with narration will ship with
            captions and a transcript; tell us if you find one that has not.
          </li>
          <li>
            <strong>Documents we send you.</strong> Files provided in response
            to an enquiry are not covered by this statement. If you need one in
            an accessible format, ask and we will produce it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'feedback',
    heading: 'Tell us when we get it wrong',
    body: (
      <>
        <p>
          If any part of this site is difficult or impossible for you to use,
          we want to know specifically — the page, what you were trying to do,
          and the browser or assistive technology you were using, if you are
          comfortable sharing it.
        </p>
        <p>
          <Link href="/contact">Send it through the contact form</Link>. We aim
          to acknowledge accessibility reports within five business days and
          will tell you what we intend to do and when. If you need the
          information on a page in another format in the meantime, ask and we
          will provide it.
        </p>
      </>
    ),
  },
];

export default function AccessibilityPage() {
  return (
    <PolicyPage
      eyebrow="Accessibility"
      title="Accessibility statement for this website."
      intro={
        <p>
          We build training for people who work under pressure, and a site that
          excludes some of them would contradict the product. This is what we
          have done, how it is verified, and — the part most vendor statements
          leave out — what we have not done yet.
        </p>
      }
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

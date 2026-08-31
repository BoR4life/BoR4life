import type { Metadata } from 'next';
import Link from 'next/link';

import { PolicyPage, type PolicySection } from '@/components/site/PolicyPage';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What this website collects, what it does not, and how to have your enquiry deleted. Written from the code, not from a template.',
};

/**
 * Privacy notice.
 *
 * EVERY statement on this page describes behaviour that is actually
 * implemented in this repository, and each claim below names the file that
 * makes it true so a future change cannot quietly falsify the page:
 *
 *   - "no cookies, nothing stored on your device"
 *       components/analytics/PostHogProvider.tsx — persistence: 'memory'
 *   - "session recording masks all text and all inputs"
 *       same file — maskAllInputs, maskTextSelector: '*'
 *   - "Do Not Track is respected"
 *       same file — respect_dnt: true
 *   - "query strings are stripped"
 *       same file — sanitize_properties
 *   - "the browser cannot contact anyone but us"
 *       lib/csp.ts — connect-src 'self' (+ the analytics origin only when
 *       analytics are configured)
 *   - the enquiry field list
 *       lib/enquiry.ts — EnquirySchema
 *   - "your IP address is held in memory only"
 *       lib/rate-limit.ts — in-process Map, no persistence
 *   - "processed in the United States"
 *       app/contact/actions.ts — Resend delivery, with the residency note
 *
 * If any of those change, this page changes in the same commit. A privacy
 * notice that drifts from the implementation is worse than none: it is a
 * written misrepresentation to a health-sector buyer.
 *
 * Deliberately NOT claimed here: any certification, any audit, any
 * standard we have not been assessed against. See docs/08-security.md.
 */

const UPDATED = '2026-08-30';

const SECTIONS: PolicySection[] = [
  {
    id: 'summary',
    heading: 'The short version',
    body: (
      <>
        <p>
          This website sets <strong>no cookies</strong>, shows no advertising,
          loads no third-party fonts, embeds no social widgets, and shares
          nothing with data brokers. The only personal information we receive
          is what you choose to type into the enquiry form.
        </p>
        <p>
          The rest of this page is the detail behind that, because
          &ldquo;we value your privacy&rdquo; is not something a procurement
          reviewer can verify.
        </p>
      </>
    ),
  },
  {
    id: 'who-we-are',
    heading: 'Who we are',
    body: (
      <p>
        Bundle of Rays is an immersive-learning company based in Buderim,
        Queensland, Australia. We build clinically authored training for
        health services and universities. This notice covers{' '}
        <strong>this website only</strong>. Training products deployed inside a
        health service or university run under that institution&rsquo;s own
        agreement and privacy arrangements, which are set out in the contract
        for that deployment rather than here.
      </p>
    ),
  },
  {
    id: 'enquiries',
    heading: 'When you send us an enquiry',
    body: (
      <>
        <p>
          The enquiry form asks for the minimum needed to reply properly, and
          nothing else:
        </p>
        <ul>
          <li>
            <strong>Your name</strong> — so we can address you.
          </li>
          <li>
            <strong>Your email address</strong> — so we can reply.
          </li>
          <li>
            <strong>Your organisation</strong> — optional, and only so the
            reply is relevant to your setting.
          </li>
          <li>
            <strong>Your role</strong> — chosen from four options, so the right
            person answers.
          </li>
          <li>
            <strong>Your message</strong>.
          </li>
        </ul>
        <p>
          There is no account to create, no newsletter opt-in buried in the
          submit button, and no profiling. Please do not send patient
          information or anything clinically identifiable through this form —
          it is a general enquiry channel, not a clinical system.
        </p>
        <p>
          Your enquiry reaches us as an email. We keep it for as long as we are
          in conversation with you and afterwards in our business
          correspondence records; we do not copy it into a marketing database.
          Our email is delivered through Resend, which processes in the United
          States. If your organisation requires in-region processing before you
          make contact,{' '}
          <Link href="/contact">tell us and we will arrange another route</Link>
          .
        </p>
      </>
    ),
  },
  {
    id: 'spam-controls',
    heading: 'The anti-spam checks on that form',
    body: (
      <>
        <p>
          Three controls run when you submit, and it is fairer to describe them
          than to have them look like hidden tracking:
        </p>
        <ul>
          <li>
            A <strong>hidden field</strong> that real people never see. Only
            automated submitters fill it in.
          </li>
          <li>
            A <strong>timing check</strong>. A form completed in under two
            seconds was not completed by a person.
          </li>
          <li>
            A <strong>rate limit</strong> keyed on your IP address. That address
            is held in the server&rsquo;s memory for the length of the limiting
            window and is never written to a database, a log, or a file. It is
            gone when the process restarts.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'analytics',
    heading: 'Analytics, and what we deliberately gave up',
    body: (
      <>
        <p>
          We measure which pages are read, so we can write better ones. Where
          analytics are enabled, they are configured with every privacy setting
          inverted from the vendor&rsquo;s defaults:
        </p>
        <ul>
          <li>
            <strong>No cookies and no device storage.</strong> Analytics state
            lives in memory for the length of your visit and is discarded when
            you close the tab. Nothing persists to identify you on a return
            visit, which means we cannot tell a returning reader from a new one
            — a real analytical cost we accepted on purpose.
          </li>
          <li>
            <strong>All text and all form inputs are masked.</strong> Anything
            you type is redacted before it leaves your browser. This is the
            setting that matters most: our visitors are clinicians and
            procurement staff, and an unmasked field on a healthcare vendor
            site is a data incident waiting to happen.
          </li>
          <li>
            <strong>Query strings and page fragments are stripped</strong> from
            every recorded address, so an identifier that ended up in a URL
            never reaches the analytics service.
          </li>
          <li>
            <strong>Do Not Track is respected.</strong> If your browser sends
            it, we do not measure you.
          </li>
          <li>
            <strong>Only clicks on links and buttons are recorded</strong> —
            never the text of the element you clicked.
          </li>
        </ul>
        <p>
          We never sell or share analytics data, and we do not combine it with
          your enquiry.
        </p>
      </>
    ),
  },
  {
    id: 'third-parties',
    heading: 'What your browser is allowed to contact',
    body: (
      <>
        <p>
          This site is served with a strict Content Security Policy that
          permits the page to make network requests to{' '}
          <strong>this website only</strong> — plus the analytics endpoint
          described above, and nothing else. Fonts are the ones already on your
          device. Our own images and video are served from our own domain.
        </p>
        <p>
          <strong>One exception, and it is yours to trigger.</strong> The home
          page carries a video published by Bodyswaps on YouTube. It is not
          embedded in the ordinary way: on page load there is no iframe, no
          YouTube script, no cookie and no request — only our own markup.
          Nothing reaches YouTube unless you press play, at which point your
          browser connects to them and they will see your IP address and that
          you watched it, exactly as they would if you opened the video on
          their own site. We use the no-cookie player, which suppresses the
          advertising cookies the standard one sets.
        </p>
        <p>
          The distinction matters: we do not hand a third party your details on
          your behalf. You decide whether to involve them, and the page works
          perfectly well if you never do.
        </p>
        <p>
          This is enforced by your browser, not merely promised by us: if a
          script on this page ever tried to send data somewhere else, the
          browser would refuse the request. You can verify it yourself in your
          browser&rsquo;s network tools.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your rights, and how to actually use them',
    body: (
      <>
        <p>
          You can ask us what we hold about you, ask for it to be corrected,
          or ask us to delete it. Use the{' '}
          <Link href="/contact">contact form</Link> or reply to any email from
          us. We will act on it — deleting an enquiry means deleting the email
          thread, which is genuinely all there is to delete.
        </p>
        <p>
          We handle personal information in line with the Australian Privacy
          Principles under the <em>Privacy Act 1988</em> (Cth). If you are in
          the United Kingdom or the European Economic Area, our basis for
          handling your enquiry is our legitimate interest in responding to a
          business enquiry you initiated, and you have the additional rights the
          UK and EU GDPR give you, including the right to complain to your
          supervisory authority. If you are in Australia, you may complain to
          the Office of the Australian Information Commissioner. We would rather
          you came to us first.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    heading: 'Children',
    body: (
      <p>
        This site is aimed at health services, universities and clinical
        educators. It is not directed at children and we do not knowingly
        collect information from them.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this notice',
    body: (
      <p>
        When the website&rsquo;s behaviour changes, this page changes in the
        same release — it is written from the code rather than from a template,
        which is the only way a notice like this stays true. The date at the top
        is the last time that happened.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="What this site collects, and what it deliberately does not."
      intro={
        <p>
          Most privacy notices are written by a lawyer who never saw the code.
          This one is written from the code, and every claim in it is something
          you can check from your own browser.
        </p>
      }
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}

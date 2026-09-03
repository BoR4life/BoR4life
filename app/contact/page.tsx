import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { EnquiryForm } from './EnquiryForm';
import { Main } from '@/components/site/Main';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Talk to Bundle of Rays about immersive clinical training for your health service, university or national program.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <Main className="px-6 py-20 md:px-16">
      <div className="mx-auto grid max-w-content gap-16 lg:grid-cols-2">
        <div>
          <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-hero leading-tight tracking-[-0.02em] text-paper-0">
            Request a demo
          </h1>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-300">
            Tell us what you are trying to achieve and we will show you how it
            works in practice — including the outcomes data your procurement
            process is going to ask for.
          </p>

          <dl className="mt-12 space-y-8">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] font-label text-ink-300">
                Who we work with
              </dt>
              <dd className="mt-2 max-w-prose text-sm leading-relaxed text-paper-100">
                Health services, universities and national nursing programs
                across Australia, the UK, the USA, Sri Lanka, South Korea and
                India.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] font-label text-ink-300">
                Response time
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-paper-100">
                Every enquiry gets a personal reply, usually within two
                business days.
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] font-label text-ink-300">
                Based in
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-paper-100">
                Buderim, Queensland, Australia
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <EnquiryForm />
        </div>
      </div>
    </Main>
  );
}

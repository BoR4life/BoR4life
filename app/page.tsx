import { HeroCanvas } from '@/components/3d/HeroCanvas';

/**
 * Home page.
 *
 * Section order follows docs/02-content-architecture.md. The hard rule:
 * sections 1 and 2 must both be reachable without scrolling on a 1440x900
 * desktop — the cinematic hero cannot push the client list below the fold.
 * That is what separates this from a portfolio site.
 *
 * Copy marked [VERIFY] is confirmed in docs/00-brand-brief.md. Nothing on
 * the PROHIBITED list appears here: no ACU, no Aspen, no growth
 * percentages, no institution attached to the PhD.
 */

const CLIENTS = [
  { name: 'Queensland Health', detail: 'Five years, longest-running' },
  { name: 'Ohio State University', detail: 'Brad Innovation Fellowship' },
  { name: 'Taegu Science University', detail: 'Repeat engagements' },
  { name: 'DY Patil, Pune', detail: 'Deployed' },
];

export default function Home() {
  return (
    <main id="main">
      <h1 className="sr-only">
        Bundle of Rays — clinically authored immersive training for healthcare
      </h1>

      <section aria-labelledby="hero-heading">
        <h2 id="hero-heading" className="sr-only">
          Practise the moment before it counts
        </h2>
        <HeroCanvas />
      </section>

      {/* Credibility bar. Deliberately immediately after the hero — the
          procurement reader must not have to hunt for this. */}
      <section
        aria-labelledby="clients-heading"
        className="border-t border-ink-700 bg-ink-900 px-6 py-10 md:px-16"
      >
        <h2
          id="clients-heading"
          className="text-xs uppercase tracking-[0.12em] text-ink-300"
        >
          Trusted in practice
        </h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CLIENTS.map((client) => (
            <li key={client.name}>
              <p className="text-lg font-semibold text-paper-100">
                {client.name}
              </p>
              <p className="mt-1 text-sm text-ink-300">{client.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="position-heading"
        className="bg-paper-100 px-6 py-24 text-ink-900 md:px-16"
      >
        <div className="mx-auto max-w-content">
          <h2
            id="position-heading"
            className="max-w-prose text-[clamp(1.75rem,3.5vw,3rem)] font-semibold leading-tight tracking-[-0.02em]"
          >
            Built by nurses, for nurses.
          </h2>
          <p className="mt-6 max-w-prose text-[1.0625rem] leading-relaxed text-ink-500">
            Every competitor in this space is a software company that hired a
            clinical advisor. Bundle of Rays is the inverse — founded in 2018
            by a nurse who worked across Australia, the UK, Afghanistan and
            Iraq, and saw that conventional training does not prepare people
            for high-consequence moments.
          </p>
        </div>
      </section>
    </main>
  );
}

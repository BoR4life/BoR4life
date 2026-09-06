/**
 * Platforms Bundle of Rays distributes.
 *
 * The relationship, confirmed by Brad: Bundle of Rays is a DISTRIBUTOR for
 * each of these companies. That is the word used on the site — not
 * "partner", which means six different things and invites the question
 * "partner how?"; not "integration", which would imply something technical
 * that has not been claimed. A distributor sells and supports another
 * company's product in a market, and that is exactly what the section says.
 *
 * The one-line descriptions are deliberately general. Each company's own
 * positioning changes, and misdescribing a partner's product on a public
 * site is the kind of thing that ends a distribution agreement. Brad
 * should read each line once before this goes to the live domain, and
 * anything sharper than this should come from the partner's own material.
 *
 * Deliberately NOT stated: which territories each agreement covers.
 * Distribution rights are almost always territory-limited, and the site
 * should not imply a reach the contract does not grant. If a partner has
 * agreed to a specific territory line, add it to that entry and nowhere
 * else.
 */

export type Partner = {
  name: string;
  /** What the platform does, in language the partner would recognise. */
  what: string;
  /** Where it fits in a Bundle of Rays engagement. */
  fit: string;
  /**
   * The specific situations this platform covers, where naming them helps a
   * buyer recognise their own problem. Only themes Brad has confirmed are
   * deployable appear here — a scenario named on the site and absent from a
   * demo is the fastest way to lose a procurement conversation.
   */
  themes?: { name: string; body: string }[];
};

export const PARTNERS: Partner[] = [
  {
    name: 'Bodyswaps',
    what: 'Immersive soft-skills training with AI-driven roleplay — communication, de-escalation, leadership.',
    fit: 'The conversational layer: the difficult exchange practised until it is not.',
    // Confirmed by Brad as deployable today. A fourth theme — distressed
    // families and breaking bad news — was considered and deliberately left
    // out because it is not currently available. Do not add it back without
    // asking him.
    themes: [
      {
        name: 'Occupational violence and aggression',
        body: 'Aggression toward staff at triage, in waiting areas and on the ward — the escalation that begins with a delay and a raised voice, long before anyone calls security.',
      },
      {
        name: 'Cognitive impairment and dementia',
        body: 'Responsive behaviours during care: resistance, agitation, refusal. A different skill from containment, because the person is not choosing the behaviour and cannot be reasoned out of it.',
      },
      {
        name: 'Mental health crisis',
        body: 'Acute distress and psychosis, where an opening line lands badly and closes the conversation for everyone who comes after you.',
      },
    ],
  },
  {
    name: 'VRpatients',
    what: 'Virtual patient simulation for clinical decision-making, built around adaptive AI patients.',
    fit: 'Case-based reasoning at scale — assess, decide, and see the consequence.',
  },
  {
    name: 'SimX',
    what: 'Virtual and augmented reality medical simulation for clinical and emergency teams.',
    fit: 'Team-based scenarios where the room, the roles and the timing all matter.',
  },
  {
    name: '3D Organon',
    what: 'Interactive 3D anatomy across VR, desktop and mobile.',
    fit: 'The foundation — structure and function, explorable rather than memorised.',
  },
];

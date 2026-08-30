/**
 * The three offers, from docs/00-brand-brief.md.
 *
 * Accredited BLS with Aspen Medical is deliberately absent. It is on the
 * PROHIBITED list — Brad's instruction is that Aspen is not mentioned
 * anywhere, and no offering is described as "nationally accredited".
 *
 * Every `proof` line below is a capability the platform genuinely has or a
 * relationship already confirmed. None is an outcome claim, because none
 * has been supplied with a citation.
 */

export type Solution = {
  slug: string;
  name: string;
  audience: string;
  summary: string;
  lede: string;
  points: { title: string; body: string }[];
  image: string;
  alt: string;
};

export const SOLUTIONS: Solution[] = [
  {
    slug: 'nursing',
    name: 'Nursing education',
    audience: 'Universities and nursing schools',
    summary:
      'Scenario-based practice for pre-registration and postgraduate cohorts, mapped to the skills a curriculum already assesses.',
    lede: 'Students can pass every written assessment and still meet their first deteriorating patient without having rehearsed one. Scenarios close that gap before placement does.',
    points: [
      {
        title: 'Repeatable without a lab booking',
        body: 'A cohort can run the same scenario as many times as it takes, without competing for simulation suite hours, manikin availability or faculty supervision.',
      },
      {
        title: 'Consistent between students',
        body: 'Every learner meets the same patient, the same deterioration and the same decision points — so performance is comparable across a cohort rather than dependent on which session they attended.',
      },
      {
        title: 'Evidence for the curriculum file',
        body: 'Decisions, communication and procedural accuracy are captured per attempt, at individual and cohort level, in the form an accreditation review asks for.',
      },
    ],
    image: '/images/hero-bay-poster',
    alt: 'A clinical resuscitation bay with a patient monitor showing live vital signs.',
  },
  {
    slug: 'patient',
    name: 'Patient education',
    audience: 'Health services and hospitals',
    summary:
      'Immersive explanation of a procedure or condition, so a patient arrives understanding what is about to happen to them.',
    lede: 'Consent conversations happen once, quickly, and often at the worst possible moment. Letting someone see the procedure first changes what they are able to take in.',
    points: [
      {
        title: 'Seen, not just described',
        body: 'A patient can look around the room they will be in and watch the procedure they have consented to, rather than reconstructing it from a leaflet and a hurried conversation.',
      },
      {
        title: 'Repeatable at the patient’s pace',
        body: 'It can be revisited at home, with family, as many times as needed — which is rarely possible with the clinician who first explained it.',
      },
      {
        title: 'Consistent across a service',
        body: 'Every patient receives the same explanation regardless of which clinician is on shift or how busy the department is that day.',
      },
    ],
    image: '/images/bay-night',
    alt: 'A clinical bay at night, lit by a single warm light.',
  },
  {
    slug: 'custom',
    name: 'Custom content',
    audience: 'Enterprise and government',
    summary:
      'Scenarios built to your protocols, your equipment and your environment — authored by clinicians, not adapted from a generic library.',
    lede: 'Off-the-shelf training teaches a generic pathway. If your service has its own escalation protocol, its own equipment and its own physical layout, the rehearsal should match it.',
    points: [
      {
        title: 'Your protocol, not a generic one',
        body: 'Scenarios follow the escalation pathway your staff are actually assessed against, including the local variations that generic content flattens out.',
      },
      {
        title: 'Your environment',
        body: 'The room, the equipment and its placement can reflect the ward staff will walk into, so recognition transfers rather than having to be relearned.',
      },
      {
        title: 'Deployed at the scale you need',
        body: 'From a single department to programs running across an institution or a region — the same content, delivered consistently wherever it is needed.',
      },
    ],
    image: '/images/pillar-environment',
    alt: 'Bedside view of a clinical bay, at the vantage a clinician works from.',
  },
];

export function solutionBySlug(slug: string): Solution | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}

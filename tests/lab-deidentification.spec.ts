import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * The de-identification scanner is the one part of The Lab's pipeline that
 * carries real risk: it stands between a nurse's raw submission and a
 * newsletter that goes to the hospitals the case came from.
 *
 * These tests assert on the specific identifiers planted in the fabricated
 * sample cases in `lab/samples/`. That is deliberate. A test that only
 * checked "some findings were returned" would pass against a scanner that
 * had lost half its rules, and this repository has already shipped a test
 * that asserted nothing. Every expectation below names a string that must
 * never survive into an issue, so the test can only pass if the rule that
 * catches it still works.
 *
 * The samples are invented. No real patient, contributor, clinician or
 * facility appears in them.
 */

const ROOT = process.cwd();
const SCANNER = path.join(ROOT, 'scripts', 'lab-scan.mjs');

type Finding = {
  rule: string;
  severity: 'BLOCK' | 'FLAG';
  checklist: string;
  label: string;
  line: number;
  match: string;
};

type Result = { file: string; findings: Finding[] };

/** Runs the scanner as the CLI, so exit code is part of what is tested. */
function scan(...files: string[]): { results: Result[]; exitCode: number } {
  const args = ['--json', ...files.map((f) => path.join(ROOT, f))];
  try {
    const stdout = execFileSync('node', [SCANNER, ...args], { cwd: ROOT, encoding: 'utf8' });
    return { results: JSON.parse(stdout) as Result[], exitCode: 0 };
  } catch (err) {
    const e = err as { status: number; stdout: string };
    return { results: JSON.parse(e.stdout) as Result[], exitCode: e.status };
  }
}

const matches = (r: Result[]) => r.flatMap((f) => f.findings).map((f) => f.match);
const rules = (r: Result[]) => new Set(r.flatMap((f) => f.findings).map((f) => f.rule));
const blocked = (r: Result[], m: string) =>
  r.flatMap((f) => f.findings).some((f) => f.match.includes(m) && f.severity === 'BLOCK');

const SAMPLES = [
  'lab/samples/dirty-01-rhythm.md',
  'lab/samples/dirty-02-imaging.md',
  'lab/samples/dirty-03-assessment.md',
];

test.describe('The Lab — de-identification scanner', () => {
  test('every dirty sample is blocked, not merely flagged', () => {
    for (const sample of SAMPLES) {
      const { results, exitCode } = scan(sample);
      const blocks = results[0]?.findings.filter((f) => f.severity === 'BLOCK') ?? [];
      expect(blocks.length, `${sample} produced no BLOCK findings`).toBeGreaterThan(0);
      expect(exitCode, `${sample} did not exit 1`).toBe(1);
    }
  });

  test('every checklist category is covered by at least one rule that fires', () => {
    const { results } = scan(...SAMPLES);
    const categories = new Set(results.flatMap((r) => r.findings).map((f) => f.checklist));

    // The six checklist items from the skill. Each must be reachable.
    expect([...categories].sort()).toEqual(
      [
        'Date of birth, or admission/event dates',
        'Free-text detail that would identify the patient to a colleague',
        'Named treating clinicians',
        'Patient name, initials, URN, MRN, Medicare number',
        'Rare presentation combined with named small facility',
        'Specific bed, room or theatre numbers',
      ].sort(),
    );
  });

  test('planted patient identifiers are caught', () => {
    const { results } = scan(...SAMPLES);
    const found = matches(results);

    // Names — one behind a cue, one bare, one dotted to initials.
    expect(blocked(results, 'husband Terry')).toBe(true);
    expect(blocked(results, 'Beverley')).toBe(true);
    expect(found).toContain('Margaret Whitcombe');
    expect(blocked(results, 'R.T.')).toBe(true);

    // Record and payer numbers, including the alphanumeric UR written as
    // prose — "her UR number is A0093481" — which an earlier rule walked past.
    expect(blocked(results, '4478213')).toBe(true);
    expect(blocked(results, 'A0093481')).toBe(true);
    expect(blocked(results, '2953 41827 1')).toBe(true);
    expect(blocked(results, '4471 82093 2')).toBe(true);

    // Dates: numeric, written-with-a-day, and the DOB keyword itself.
    expect(blocked(results, '14/03/1958')).toBe(true);
    expect(blocked(results, '11/09/2026')).toBe(true);
    expect(blocked(results, '3rd August')).toBe(true);
    expect(blocked(results, '22 September')).toBe(true);
    expect(blocked(results, 'DOB')).toBe(true);

    // Contact details.
    expect(blocked(results, '0412 447 991')).toBe(true);
    expect(blocked(results, '0455 218 664')).toBe(true);
    expect(blocked(results, '0433 887 210')).toBe(true);
    expect(blocked(results, 'jenny.rowe@example-health.org')).toBe(true);
  });

  test('named clinicians are caught across the titles nurses actually write', () => {
    const { results } = scan(...SAMPLES);
    for (const clinician of ['Dr Hargreaves', 'Sr Patterson', 'Dr Kelly', 'Dr Ansari', 'Mr Coulthard']) {
      expect(blocked(results, clinician), `${clinician} not blocked`).toBe(true);
    }
  });

  test('bed, bay and theatre numbers are caught', () => {
    const { results } = scan(...SAMPLES);
    for (const location of ['bed 4', 'resus 2', 'bed 12', 'theatre 3', 'theatre 2']) {
      expect(blocked(results, location), `${location} not blocked`).toBe(true);
    }
  });

  test('a facility name broken across a soft line wrap is still caught', () => {
    // Submissions arrive wrapped. "Tewantin Family\n  Medical Centre" is one
    // name; a line-by-line scanner walks straight past it, which is why the
    // scanner works on paragraphs.
    const { results } = scan('lab/samples/dirty-01-rhythm.md');
    const facility = results
      .flatMap((r) => r.findings)
      .find((f) => f.rule === 'facility' && /Tewantin/.test(f.match));
    expect(facility, 'wrapped facility name was not detected').toBeTruthy();
  });

  test('re-identification-by-mosaic cues are surfaced for a human', () => {
    const { results } = scan(...SAMPLES);
    const fired = rules(results);
    // These are the ones a regex cannot decide but must not leave silent:
    // the sole-provider claim, the identifying occupation, and the admission
    // that staff already recognised the patient.
    expect(fired.has('sole-provider')).toBe(true);
    expect(fired.has('employer-or-role')).toBe(true);
    expect(fired.has('recognised-locally')).toBe(true);
    expect(fired.has('facility')).toBe(true);
  });

  test('the worked example carries no blocking identifier', () => {
    const { results, exitCode } = scan('lab/samples/worked-example/structured.md');
    const blocks = results.flatMap((r) => r.findings).filter((f) => f.severity === 'BLOCK');
    expect(blocks.map((b) => `${b.line}: ${b.match}`), 'worked example still contains a BLOCK').toEqual([]);
    expect(exitCode).toBe(0);
  });

  test('the assembled worked issue carries no blocking identifier', () => {
    const { results, exitCode } = scan('lab/samples/worked-example/issue.md');
    const blocks = results.flatMap((r) => r.findings).filter((f) => f.severity === 'BLOCK');
    expect(blocks.map((b) => `${b.line}: ${b.match}`), 'worked issue still contains a BLOCK').toEqual([]);
    expect(exitCode).toBe(0);
  });

  test('the assembled worked issue makes no accreditation claim', () => {
    const issue = execFileSync('cat', [path.join(ROOT, 'lab/samples/worked-example/issue.md')], {
      encoding: 'utf8',
    });
    // CPD in The Lab is self-declared. These words assert an entitlement the
    // program cannot grant, and no draft may improvise around them.
    for (const claim of [
      /\baccredited\b/i,
      /\bendorsed\b/i,
      /\bCPD points\b/i,
      /\bearns? (?:one|a|\d+) CPD\b/i,
      /counts towards your registration/i,
      /\bAHPRA[- ]approved\b/i,
    ]) {
      expect(issue, `worked issue asserts accreditation: ${claim}`).not.toMatch(claim);
    }
    expect(issue).toMatch(/self-declared/i);
  });
});

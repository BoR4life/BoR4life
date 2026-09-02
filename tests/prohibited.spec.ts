import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Guard against re-committing a name that must not appear in this public
 * repository.
 *
 * This exists because it already happened. Comments and briefing notes
 * explaining *why* certain parties were being withheld were committed to a
 * public repo, which disclosed both the relationships and the agreements
 * protecting them. The fix was to move the names to
 * `docs/constraints.local.md`, which is untracked.
 *
 * The test therefore cannot contain the names either — it reads them from
 * that untracked file. Where the file is absent (CI, a fresh clone) the
 * test skips loudly rather than passing quietly, because a green tick that
 * checked nothing is worse than an obvious gap.
 */

// Playwright runs from the project root, so cwd is the repo. Avoids
// __dirname, which is not defined under this project's ESM config.
const ROOT = process.cwd();
const CONSTRAINTS = path.join(ROOT, 'docs', 'constraints.local.md');

function prohibitedTerms(): string[] {
  const raw = readFileSync(CONSTRAINTS, 'utf8');
  // Bold entries in the "Never published" list are the names to guard.
  return [...raw.matchAll(/\*\*(.+?)\*\*/g)]
    .map((m) => m[1] ?? '')
    .flatMap((entry) => {
      // An entry of the form "Full Name (ACRONYM)." yields both the long
      // form and the acronym, so either spelling is caught.
      const cleaned = entry.replace(/[.,]$/, '');
      const acronym = cleaned.match(/\(([A-Z]{2,})\)/)?.[1];
      const base = cleaned.replace(/\s*\([^)]*\)/, '');
      return acronym ? [base, acronym] : [base];
    })
    .filter((t) => /^[A-Za-z][A-Za-z ]{2,}$/.test(t));
}

test('no prohibited party name appears in a tracked file', () => {
  test.skip(
    !existsSync(CONSTRAINTS),
    'docs/constraints.local.md is absent, so the prohibited-name guard cannot run here. It is enforced on the machine that holds that file, and by review.',
  );

  const terms = prohibitedTerms();
  expect(terms.length, 'no terms parsed from the constraints file').toBeGreaterThan(0);

  const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .filter((f) => !/\.(webp|avif|png|jpe?g|mp4|glb|ico|woff2?)$/i.test(f))
    .filter((f) => f !== 'package-lock.json');

  const hits: string[] = [];
  for (const file of tracked) {
    const body = readFileSync(path.join(ROOT, file), 'utf8');
    for (const term of terms) {
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(body)) hits.push(`${file} contains a prohibited party name`);
    }
  }

  // The message deliberately does not repeat the term.
  expect(hits, hits.join('\n')).toEqual([]);
});

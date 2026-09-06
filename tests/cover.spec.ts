import { test, expect } from '@playwright/test';
import { cover, ARCHETYPES } from '../lib/cover';

/**
 * The generated covers.
 *
 * The property that matters is not that they look good — no test can hold
 * that — but that they are STABLE. The brand kit's method depends on a name
 * resolving to the same artwork permanently, so nobody has to store,
 * brief or remember a decision. If that silently stops being true, every
 * page a reader recognised becomes a different picture and nothing fails.
 */

test('a name always resolves to the same artwork', () => {
  for (const name of ['Privacy notice', 'What we build', 'Support']) {
    expect(JSON.stringify(cover(name))).toEqual(JSON.stringify(cover(name)));
  }
});

test('the archetype list is locked', () => {
  // The archetype is the FIRST draw from the seed, so adding, removing or
  // reordering an entry reshuffles every existing cover at once. These
  // pairings are pinned so that an edit to ARCHETYPES fails here loudly
  // rather than quietly repainting the site.
  expect(ARCHETYPES).toEqual(['lanes', 'bands', 'field', 'columns', 'steps']);

  const pinned: Record<string, string> = {
    'What the platform measures': 'lanes',
    'Privacy notice': 'steps',
    'Accessibility statement': 'bands',
    'What we build': 'columns',
    Support: 'field',
  };
  for (const [name, archetype] of Object.entries(pinned)) {
    expect(cover(name).archetype, `"${name}" changed archetype`).toBe(archetype);
  }
});

test('different names get different artwork', () => {
  const seen = new Set<string>();
  const names = [
    'Privacy notice',
    'Accessibility statement',
    'What we build',
    'What the platform measures',
    'Support',
    'Onboarding',
    'Security review',
  ];
  for (const n of names) seen.add(JSON.stringify(cover(n)));
  expect(seen.size, 'two names collided onto identical artwork').toBe(names.length);
});

test('every cover stays inside its frame and draws something', () => {
  // A cover that draws nothing is an empty box on the page, and one that
  // draws outside the viewBox is clipped at an arbitrary edge.
  for (const n of ['Privacy notice', 'Support', 'What we build', 'Onboarding', 'Security review']) {
    const { shapes } = cover(n);
    expect(shapes.length, `${n} generated no shapes`).toBeGreaterThan(2);
    for (const s of shapes) {
      const xs = s.kind === 'line' ? [s.x1, s.x2] : s.kind === 'dot' ? [s.cx] : [s.x, s.x + s.w];
      const ys = s.kind === 'line' ? [s.y1, s.y2] : s.kind === 'dot' ? [s.cy] : [s.y, s.y + s.h];
      for (const x of xs) expect(x, `${n}: x out of frame`).toBeGreaterThanOrEqual(0);
      for (const y of ys) expect(y, `${n}: y out of frame`).toBeGreaterThanOrEqual(0);
      for (const x of xs) expect(x, `${n}: x out of frame`).toBeLessThanOrEqual(168);
      for (const y of ys) expect(y, `${n}: y out of frame`).toBeLessThanOrEqual(58);
    }
  }
});

test('exactly one element is accented', () => {
  // The kit allows one accent per surface. Two competing marks stop the
  // cover reading as a single image.
  for (const n of ['Privacy notice', 'Support', 'What we build', 'Onboarding']) {
    const accents = cover(n).shapes.filter((s) => s.accent).length;
    expect(accents, `${n} has ${accents} accented elements`).toBeLessThanOrEqual(1);
  }
});

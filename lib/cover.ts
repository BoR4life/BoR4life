/**
 * Deterministic cover artwork, derived from a name.
 *
 * The brand kit's method: every module gets a cover generated from its own
 * title, the output is deterministic, and "a code resolves to the same
 * artwork permanently" so the decision is never stored, briefed or
 * remembered. Nobody chooses a picture, nobody maintains an asset library,
 * and a page that gains a section gains artwork for it at no cost.
 *
 * This is the method only. The kit's own shape vocabulary — the arch, the
 * ray bundle, the pair of eyes — is explicitly "the mark's own and nothing
 * else", and the mark is not cleared for company use. Generating from those
 * shapes would produce derivative works of artwork we have no licence to,
 * which is worse than not generating at all. So the vocabulary here is the
 * site's own: the lanes-and-marks language already established by the
 * scenario timeline on /evidence, which reads as measurement over time
 * because that is what this company sells.
 *
 * If the mark is ever cleared, the archetypes below are the place to add
 * its shapes — and see the warning about ordering before doing so.
 *
 * Everything is drawn from tokens via Tailwind's fill and stroke utilities,
 * so covers follow the palette rather than pinning colours of their own,
 * and there is no `style` attribute anywhere for the CSP to refuse.
 */

/** FNV-1a. Small, stable, and not trying to be a cryptographic hash. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded PRNG, so a seed always replays identically. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The five archetypes, which keep output composed rather than random.
 *
 * LOCK THIS LIST. The archetype is the first draw from the seed, so adding
 * an entry, removing one, or reordering them reshuffles every cover on the
 * site at once — a page whose artwork a reader recognised last month
 * quietly becomes a different picture. The kit gives the same warning.
 * Appending at the END is the only safe change, and even that shifts
 * nothing only because the index of every existing entry is unmoved.
 */
export const ARCHETYPES = ['lanes', 'bands', 'field', 'columns', 'steps'] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export type Shape =
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; accent: boolean }
  | { kind: 'dot'; cx: number; cy: number; r: number; accent: boolean }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; accent: boolean };

export type Cover = { archetype: Archetype; shapes: Shape[] };

// Near 3:1. A cover is a band at the head of a card, not a panel that
// competes with the title under it — at 3:2 the first cut of this read as
// the subject of the card rather than its decoration.
const W = 168;
const H = 58;

/**
 * Build the cover for a name. Pure: same string in, same shapes out, on
 * every machine and every render, with nothing persisted.
 */
export function cover(name: string): Cover {
  const next = rng(hash(name));

  // FIRST DRAW is the archetype — see the lock warning above.
  const archetype = ARCHETYPES[Math.floor(next() * ARCHETYPES.length)] as Archetype;

  // Exactly one element is accented. The kit allows one accent per surface,
  // and a cover with two competing marks stops reading as a single image.
  const shapes: Shape[] = [];
  const accentAt = Math.floor(next() * 4);

  if (archetype === 'lanes') {
    const rows = 3 + Math.floor(next() * 2);
    for (let r = 0; r < rows; r++) {
      const y = ((r + 1) * H) / (rows + 1);
      shapes.push({ kind: 'line', x1: 10, y1: y, x2: W - 10, y2: y, accent: false });
      const marks = 3 + Math.floor(next() * 4);
      // Marks are placed on an even division with a bounded jitter, never
      // at a free random x. Two free draws land on top of each other often
      // enough to matter, and a pair of touching dots reads as a rendering
      // fault rather than a rhythm.
      const span = (W - 36) / marks;
      for (let m = 0; m < marks; m++) {
        shapes.push({
          kind: 'dot',
          cx: 18 + m * span + span * (0.25 + next() * 0.5),
          cy: y,
          r: 2.2,
          accent: r === accentAt % rows && m === 0,
        });
      }
    }
  } else if (archetype === 'bands') {
    // Heights are bounded so a single band can never fill the frame — the
    // first cut let one grow to most of the height and it read as a flat
    // grey slab, which looks like an image that failed to load.
    let y = 9;
    let i = 0;
    while (y < H - 12 && i < 7) {
      const h = 2.5 + next() * 5;
      shapes.push({ kind: 'rect', x: 12, y, w: W - 24, h, accent: i === accentAt });
      y += h + 3.5 + next() * 4;
      i++;
    }
  } else if (archetype === 'field') {
    const cols = 9 + Math.floor(next() * 5);
    const rows = 3 + Math.floor(next() * 2);
    let i = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (next() < 0.28) continue; // holes keep it from reading as a texture
        shapes.push({
          kind: 'dot',
          cx: 14 + (c * (W - 28)) / (cols - 1),
          cy: 12 + (r * (H - 24)) / (rows - 1),
          r: 2,
          accent: i === accentAt * 5,
        });
        i++;
      }
    }
  } else if (archetype === 'columns') {
    const n = 7 + Math.floor(next() * 6);
    for (let c = 0; c < n; c++) {
      const x = 14 + (c * (W - 28)) / (n - 1);
      const h = 8 + next() * (H - 26);
      shapes.push({ kind: 'rect', x: x - 2, y: H - 10 - h, w: 4, h, accent: c === accentAt });
    }
  } else {
    // steps: a progression, which is the only thing the kit lets a scale encode
    const n = 5 + Math.floor(next() * 3);
    for (let st = 0; st < n; st++) {
      const x = 14 + (st * (W - 28)) / n;
      const y = H - 10 - ((st + 1) * (H - 22)) / n;
      shapes.push({ kind: 'line', x1: x, y1: y, x2: x + (W - 28) / n - 5, y2: y, accent: st === accentAt });
      shapes.push({ kind: 'dot', cx: x, cy: y, r: 2.2, accent: false });
    }
  }

  return { archetype, shapes };
}

export const COVER_VIEWBOX = { width: W, height: H };

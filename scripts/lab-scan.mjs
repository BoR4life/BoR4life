#!/usr/bin/env node
/**
 * lab-scan — deterministic identifier scanner for The Lab case submissions.
 *
 * This is the mechanical half of de-identification. It cannot read a case for
 * meaning, so it does not try; it finds the patterns that are identifying
 * regardless of context and refuses to let them through. The editorial half —
 * "would a colleague on that unit know who this is?" — is human judgement,
 * carried out against the checklist in the-lab skill references.
 *
 * It is deliberately noisy. A false positive costs a reviewer ten seconds. A
 * false negative publishes a patient. Every rule here is tuned to over-flag,
 * and nothing in this file should be relaxed to make a scan quieter. Where a
 * term is genuinely benign and recurs, add it to `lab/deid-allowlist.txt`
 * rather than weakening a rule.
 *
 * Submissions arrive soft-wrapped, so scanning is done per paragraph rather
 * than per line — "Tewantin Family\nMedical Centre" is one name, and a
 * line-by-line scanner walks straight past it. Line numbers are recovered
 * from the offset within the paragraph.
 *
 * Usage:
 *   node scripts/lab-scan.mjs lab/cases/2026-10-rhythm.raw.md
 *   node scripts/lab-scan.mjs --json lab/samples/*.md
 *
 * Exit codes:
 *   0  clean, or FLAG findings only
 *   1  at least one BLOCK finding
 *   2  bad invocation
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
/**
 * Two allowlists, both optional. The tracked one holds clinical vocabulary.
 * The local one is untracked, and is where site and locality names belong —
 * this repository is public and those names are business-sensitive.
 */
const ALLOWLIST_FILES = [
  path.join(ROOT, 'lab', 'deid-allowlist.txt'),
  path.join(ROOT, 'lab', 'deid-allowlist.local.txt'),
];

/**
 * BLOCK — identifying on its own, wherever it appears. Cannot progress.
 * FLAG  — may be innocent, may not. A human decides, and records the decision.
 */
const RULES = [
  {
    id: 'medicare',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Medicare-shaped number',
    // 10 digits, optionally spaced 4-5-1, optionally with an IRN suffix.
    re: /\b\d{4}[ -]?\d{5}[ -]?\d(?:[ /-]\d)?\b/g,
  },
  {
    id: 'record-number',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Record identifier (URN/MRN/UR/NHI/patient number)',
    // The keyword and the number are often separated by filler — "UR number
    // is A0093481" — so the connector is matched loosely. The generic words
    // (patient, record, admission) need an explicit id word after them:
    // without that, "the patient was 168 and clammy" reads as a record
    // number, and a false BLOCK stops work rather than costing a glance.
    re: /\b(?:URN|MRN|UR|NHI|IHI)\b(?:[\s:#.-]*(?:no\.?|number|id|code|is|was))*[\s:#.-]*[A-Z]{0,3}[-\s]?\d{3,}|\b(?:hospital|patient|record|admission|episode|chart|file)[\s-]*(?:no\.?|number|id|code)\b(?:[\s:#.-]*(?:is|was))?[\s:#.-]*[A-Z]{0,3}[-\s]?\d{3,}/gi,
  },
  {
    id: 'record-number-shape',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Record-shaped identifier (letter prefix and a long digit run)',
    re: /\b[A-Z]{1,3}\d{5,}\b/g,
  },
  {
    id: 'record-number-bare',
    severity: 'FLAG',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Record-identifier keyword with no number attached — confirm the number was removed, not merely moved',
    re: /\b(?:URN|MRN|NHI|IHI)\b/g,
  },
  {
    id: 'named-clinician',
    severity: 'BLOCK',
    checklist: 'Named treating clinicians',
    label: 'Named clinician (title + surname)',
    re: /\b(?:Dr|Doctor|Prof|Professor|A\/?Prof|Assoc\.? Prof|Mr|Mrs|Ms|Miss|Sr|Sister|Matron|RN|EN|NP|CNC|CNS|NUM|AIN|Reg|Registrar|Consultant|Intern|Resident|RMO|SMO|VMO|Anaesthetist|Surgeon)\.?\s+[A-Z][a-z]{1,}\b/g,
  },
  {
    id: 'name-cue',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Proper name following a person cue',
    re: /\b(?:patient|pt\.?|client|resident|deceased|husband|wife|partner|spouse|son|daughter|mother|father|sister|brother|carer|named|called|name(?:\s+is|\s+was)?)\s+(?:is\s+|was\s+|a\s+|an\s+|the\s+)?[A-Z][a-z]{2,}\b/g,
  },
  {
    id: 'initials-titled',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Initial standing in for a name (title or person cue + capital)',
    re: /\b(?:Mr|Mrs|Ms|Miss|Dr|patient|pt\.?|client)\.?\s+[A-Z]\b\.?/g,
  },
  {
    id: 'initials-dotted',
    severity: 'BLOCK',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Dotted initials',
    re: /\b[A-Z]\.[A-Z]\.(?:[A-Z]\.)?/g,
  },
  {
    id: 'date-numeric',
    severity: 'BLOCK',
    checklist: 'Date of birth, or admission/event dates',
    label: 'Calendar date (numeric)',
    re: /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
  },
  {
    id: 'date-written',
    severity: 'BLOCK',
    checklist: 'Date of birth, or admission/event dates',
    label: 'Calendar date with a day — month or season alone is permitted, a day is not',
    re: /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?\b/g,
  },
  {
    id: 'year',
    severity: 'FLAG',
    checklist: 'Date of birth, or admission/event dates',
    label: 'Four-digit year — narrows the event window; month and season alone are permitted',
    re: /\b(?:19|20)\d{2}\b/g,
  },
  {
    id: 'dob',
    severity: 'BLOCK',
    checklist: 'Date of birth, or admission/event dates',
    label: 'Date of birth keyword',
    re: /\b(?:DOB|D\.O\.B\.?|date of birth|born (?:in|on)\b)/gi,
  },
  {
    id: 'clock-time',
    severity: 'FLAG',
    checklist: 'Date of birth, or admission/event dates',
    label: 'Clock time — keep only where the interval is the teaching point, and never with a date',
    re: /\b(?:[01]?\d|2[0-3])[:.]?[0-5]\d\s?(?:hrs|h|am|pm)\b|\bat\s(?:[01]\d|2[0-3])[0-5]\d\b/gi,
  },
  {
    id: 'bed-location',
    severity: 'BLOCK',
    checklist: 'Specific bed, room or theatre numbers',
    label: 'Bed, bay, room, cubicle, chair, ward or theatre number',
    re: /\b(?:bed|bay|room|cubicle|chair|ward|theatre|theater|resus(?:\s+bay)?|pod|cot)\s*#?\s*\d+[A-Za-z]?\b/gi,
  },
  {
    id: 'facility',
    severity: 'FLAG',
    checklist: 'Rare presentation combined with named small facility',
    label: 'Named facility — weigh re-identification risk against how rare the presentation is',
    re: /\b(?:[A-Z][A-Za-z'-]+\s+){1,3}(?:Hospital|Health Service|Health Care Service|Medical Centre|Medical Center|Private|Clinic|Day Surgery|Base Hospital|District Hospital|Aged Care|Nursing Home|Practice)\b/g,
  },
  {
    id: 'sole-provider',
    severity: 'FLAG',
    checklist: 'Rare presentation combined with named small facility',
    label: 'Sole-provider or first-of-its-kind claim — powerfully re-identifying in a small catchment',
    re: /\b(?:only (?:place|hospital|unit|centre|service|case|patient)\b|first (?:case|patient|time) (?:of|in|we|any)|never seen (?:before|one)|no(?:body|-one|one) (?:here |on the unit )?had seen|the only \w+ (?:within|in) )/gi,
  },
  {
    id: 'locality',
    severity: 'FLAG',
    checklist: 'Free-text detail that would identify the patient to a colleague',
    label: 'Street address, suburb or postcode',
    re: /\b\d{1,4}[a-zA-Z]?\s+[A-Z][a-z]+\s+(?:St|Street|Rd|Road|Ave|Avenue|Dr|Drive|Cres|Crescent|Pde|Parade|Ct|Court|Lane|Ln|Hwy|Highway|Terrace|Tce|Way|Close|Cl)\b|\b(?:NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s*\d{4}\b/g,
  },
  {
    id: 'contact',
    severity: 'BLOCK',
    checklist: 'Free-text detail that would identify the patient to a colleague',
    label: 'Phone number, email address or vehicle registration',
    re: /\b(?:\+?61\s?|0)[2-478](?:[ -]?\d){8}\b|\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b|\b(?:rego|registration|number ?plate)\b[\s:]*[A-Z0-9]{3,7}\b/gi,
  },
  {
    id: 'employer-or-role',
    severity: 'FLAG',
    checklist: 'Free-text detail that would identify the patient to a colleague',
    label: 'Occupation, employer or public role — identifying in a small community',
    re: /\b(?:works? (?:at|for|as)|employed (?:at|by|as)|employer|local (?:mayor|councillor|MP|publican|GP|principal|teacher|police officer|firefighter|identity|business ?owner)|fire (?:captain|chief)|retired [a-z]+|a well[- ]known|well known locally|the (?:mayor|MP|principal|publican))\b/gi,
  },
  {
    id: 'distinguishing-feature',
    severity: 'FLAG',
    checklist: 'Free-text detail that would identify the patient to a colleague',
    label: 'Distinguishing personal detail',
    re: /\b(?:tattoo|amputee|prosthe(?:sis|tic)|interpreter|refugee|asylum|prisoner|in custody|corrections|flown in from|medi-?vac|retrieval from|twin|triplet|IVF|celebrity|professional (?:athlete|footballer|player)|Olympi|bariatric surgery abroad)/gi,
  },
  {
    id: 'recognised-locally',
    severity: 'FLAG',
    checklist: 'Free-text detail that would identify the patient to a colleague',
    label: 'Explicit statement that staff recognised the patient — re-identification is already established',
    re: /\b(?:everyone (?:on the unit |here )?kn(?:ew|ows)|half the (?:unit|ward|department) recognised|we all kn(?:ew|ow) (?:her|him|them)|recognised (?:her|him|them) on arrival|a regular (?:here|on the unit))\b/gi,
  },
  {
    id: 'staff-roster-detail',
    severity: 'FLAG',
    checklist: 'Named treating clinicians',
    label: 'Shift or roster detail that identifies which staff were on duty',
    re: /\b(?:night duty on|on the (?:night|evening|morning) of|my shift on|rostered on(?: the)?)\b/gi,
  },
  {
    id: 'proper-name-pair',
    severity: 'FLAG',
    checklist: 'Patient name, initials, URN, MRN, Medicare number',
    label: 'Capitalised word pair — a personal name unless it is on the allowlist',
    re: /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{1,})+\b/g,
    // Allowlisted per-word: a pair survives only if BOTH words are unknown.
    allowlisted: true,
  },
];

/**
 * Words that make a capitalised pair ordinary rather than personal. Clinical
 * and organisational vocabulary, headings, and the units and modalities that
 * legitimately appear capitalised. Extended per-project in
 * `lab/deid-allowlist.txt` — one term per line, `#` comments.
 */
const BASE_ALLOWLIST = `
Emergency Coronary Care Clinical Nurse Surgical Ward Unit Hospital Health Medical
Centre Private Intensive Critical Cardiac Theatre Recovery Surgery Ambulance
Queensland Sunshine Coast Australian Australia January February March April May
June July August September October November December Monday Tuesday Wednesday
Thursday Friday Saturday Sunday Summer Autumn Winter Spring Case Notes Teaching
Point Contributed Submitted Sending Sample Test Fabricated Every Written Patient
Obs Bloods Chest Abdomen Presenting Complaint Investigations Observations Arrival
Course Outcome Contributor Role Site Bio Issue Question Answer Reasoning Evidence
Paper Drug Device Quiz Link Review Editor Draft Consent Acknowledgement Rhythm
Imaging Assessment Pathology Management Decision Escalation Deterioration
Anticoagulation Sepsis Trauma Respiratory Renal Neuro Orthopaedic General
Perioperative Anaesthetics Radiology Laboratory Pharmacy Physiotherapy
Occupational Speech Social Work Discharge Admission Transfer Handover Round
Rounds Protocol Guideline Pathway Policy Standard Standards National Safety
Quality Commission Council Board College Association Federation Foundation
Journal Medicine Nursing Emergency Resuscitation Council Lab Curiosity Bedside
The Lab Bundle Rays Academy Brad Chesham Phase One Two Three Month Year Number
Not Real This That These Those There Here When Where What Which While With
Without From Into Over Under After Before During Because However Although
Rather Instead Whether Either Neither Both Each Some None All Any Most More
Less Same Other Another Next Last First Second Third Final Initial Early Late
Left Right Anterior Posterior Lateral Medial Proximal Distal Superior Inferior
Acute Chronic Severe Moderate Mild Stable Unstable Normal Abnormal Positive
Negative High Low Raised Reduced Elevated Increased Decreased Present Absent
Sinus Atrial Ventricular Supraventricular Junctional Nodal Bundle Branch Block
Anaesthetic Analgesia Sedation Airway Breathing Circulation Disability Exposure
`
  .split(/\s+/)
  .filter(Boolean);

function loadAllowlist() {
  const terms = new Set(BASE_ALLOWLIST.map((t) => t.toLowerCase()));
  for (const file of ALLOWLIST_FILES) {
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, 'utf8').split('\n')) {
      const line = raw.split('#')[0].trim();
      if (!line) continue;
      for (const word of line.split(/\s+/)) terms.add(word.toLowerCase());
    }
  }
  return terms;
}

/** Lines the scanner itself wrote — annotations, not case content. */
const ANNOTATION = /^\s*(?:<!--\s*)?(?:\[(?:BLOCK|FLAG|REDACTED|REMOVED|SCAN)\]|scan:)/i;

/**
 * Split into paragraphs so soft-wrapped names are seen whole, keeping the
 * byte offset of each paragraph so a match can be mapped back to a line.
 */
function paragraphs(text) {
  const lines = text.split('\n');
  const out = [];
  let buf = [];
  let start = 0;

  const flush = () => {
    if (buf.length) out.push({ text: buf.join(' '), startLine: start + 1, lines: buf.slice() });
    buf = [];
  };

  lines.forEach((line, i) => {
    if (line.trim() === '' || ANNOTATION.test(line)) {
      flush();
      return;
    }
    if (buf.length === 0) start = i;
    buf.push(line);
  });
  flush();
  return out;
}

/** Map an offset inside a joined paragraph back to an absolute line number. */
function lineOf(para, offset) {
  let consumed = 0;
  for (let i = 0; i < para.lines.length; i += 1) {
    consumed += para.lines[i].length + 1; // +1 for the joining space
    if (offset < consumed) return para.startLine + i;
  }
  return para.startLine;
}

function scanText(text, allowlist = loadAllowlist()) {
  const findings = [];

  for (const para of paragraphs(text)) {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(para.text)) !== null) {
        if (m[0].length === 0) {
          rule.re.lastIndex += 1;
          continue;
        }
        if (rule.allowlisted) {
          const words = m[0].split(/\s+/);
          // Ordinary language unless every word in the pair is unknown.
          if (words.some((w) => allowlist.has(w.toLowerCase()))) continue;
        }
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          checklist: rule.checklist,
          label: rule.label,
          line: lineOf(para, m.index),
          match: m[0].trim(),
        });
      }
    }
  }

  findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
  return findings;
}

function scanFile(file) {
  return { file, findings: scanText(readFileSync(file, 'utf8')) };
}

function report(results) {
  let blocks = 0;
  let flags = 0;

  for (const { file, findings } of results) {
    const rel = path.relative(ROOT, file);
    process.stdout.write(`\n  ${rel}\n`);
    if (findings.length === 0) {
      process.stdout.write('    no mechanical identifiers found — editorial review still required\n');
      continue;
    }
    for (const f of findings) {
      if (f.severity === 'BLOCK') blocks += 1;
      else flags += 1;
      process.stdout.write(
        `    ${f.severity.padEnd(5)} line ${String(f.line).padStart(3)}  ${f.label}\n` +
          `            match: ${JSON.stringify(f.match)}\n`,
      );
    }
  }

  process.stdout.write(
    `\n  ${blocks} BLOCK, ${flags} FLAG across ${results.length} file(s).\n` +
      (blocks > 0
        ? '  Blocked. Remove or generalise every BLOCK, then re-scan.\n'
        : flags > 0
          ? '  No blocks. Every FLAG needs a recorded human decision before sign-off.\n'
          : '  Mechanically clean. Editorial de-identification review is still outstanding.\n'),
  );

  return blocks;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]).endsWith('lab-scan.mjs');

if (isMain) {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const files = args.filter((a) => !a.startsWith('--'));

  if (files.length === 0) {
    process.stderr.write('usage: node scripts/lab-scan.mjs [--json] <file>...\n');
    process.exit(2);
  }

  const results = files.map(scanFile);
  const blocked = results.some((r) => r.findings.some((f) => f.severity === 'BLOCK'));

  if (asJson) process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  else report(results);

  process.exit(blocked ? 1 : 0);
}

export { scanText, scanFile, loadAllowlist, RULES };

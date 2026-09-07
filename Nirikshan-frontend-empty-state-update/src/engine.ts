import type { EvidenceItem, Inspection, RuleResult, Severity, ViolationItem, CaptureMethod } from './types';

// Deterministic seeded RNG so a given inspection id always produces the same
// "AI extraction" outcome — reproducible for a demo, but varies per record.
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rng(seed: string) {
  return mulberry32(hashSeed(seed));
}

interface RuleTemplate {
  id: string;
  requirement: string;
  observedGood: (rand: () => number) => string;
  observedBad: (rand: () => number) => string;
  severity: Severity;
}

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: 'LMPC-06',
    requirement: 'MRP declaration is present and readable',
    observedGood: () => '₹ MRP printed, legible, inclusive-of-taxes marked',
    observedBad: (r) => `₹${Math.round(40 + r() * 400)} — inclusive-of-taxes text partially obscured`,
    severity: 'MAJOR',
  },
  {
    id: 'LMPC-13',
    requirement: 'Net quantity is declared with a valid standard unit',
    observedGood: (r) => `${(0.5 + r() * 4.5).toFixed(2)} kg declared in standard units`,
    observedBad: (r) => `${(0.5 + r() * 4.5).toFixed(2)} — unit abbreviation non-standard`,
    severity: 'MINOR',
  },
  {
    id: 'LMPC-10',
    requirement: 'Consumer care name, address and contact are present',
    observedGood: () => 'Consumer care details present with valid phone/email',
    observedBad: () => 'Consumer care phone number missing / unreadable',
    severity: 'MAJOR',
  },
  {
    id: 'LMPC-08',
    requirement: 'Required declaration character height is met',
    observedGood: (r) => `${(3.0 + r() * 1.2).toFixed(1)} mm ± 0.3 mm`,
    observedBad: (r) => `${(1.6 + r() * 1.1).toFixed(1)} mm ± 0.3 mm — below required 2.0 mm`,
    severity: 'MAJOR',
  },
  {
    id: 'LMPC-04',
    requirement: 'Manufacturer / packer / importer name and address declared',
    observedGood: () => 'Full manufacturer address block present and legible',
    observedBad: () => 'Manufacturer address block cropped in captured frame',
    severity: 'CRITICAL',
  },
  {
    id: 'LMPC-11',
    requirement: 'Month and year of manufacture / import declared',
    observedGood: (r) => `Manufactured ${['01', '04', '07', '10'][Math.floor(r() * 4)]}/202${4 + Math.floor(r() * 2)}`,
    observedBad: () => 'Manufacture date field not detected in frame',
    severity: 'MINOR',
  },
];

const PHOTO_LABELS = ['Front panel', 'Back panel', 'Side panel', 'MRP close-up'];

export interface GeneratedResult {
  score: number;
  confidence: number;
  status: Inspection['status'];
  severity?: Severity;
  action?: string;
  rules: RuleResult[];
  violationDetails: ViolationItem[];
  evidence: EvidenceItem[];
}

export function generateInspectionResult(
  id: string,
  capture: CaptureMethod,
  capturedCount: number,
  ruleCount = 4,
): GeneratedResult {
  const rand = rng(id);
  const templates = [...RULE_TEMPLATES].sort(() => rand() - 0.5).slice(0, ruleCount);

  if (capturedCount < 3) {
    const evidence: EvidenceItem[] = PHOTO_LABELS.map((label, i) => ({
      label,
      status: i < capturedCount ? 'Ready' : 'Flagged',
      source: capture,
    }));
    return {
      score: 0,
      confidence: 0.4 + rand() * 0.2,
      status: 'INSUFFICIENT EVIDENCE',
      action: 'Recapture required views',
      rules: [],
      violationDetails: [],
      evidence,
    };
  }

  const rules: RuleResult[] = [];
  const violationDetails: ViolationItem[] = [];
  let confidenceSum = 0;
  let worstSeverity: Severity | undefined;

  templates.forEach((t, i) => {
    const passRoll = rand();
    const pass = passRoll > 0.32;
    const confidence = pass ? 0.85 + rand() * 0.14 : 0.55 + rand() * 0.34;
    const status: RuleResult['status'] = pass ? 'PASS' : confidence >= 0.65 ? 'REVIEW' : 'FAIL';
    const observed = pass ? t.observedGood(rand) : t.observedBad(rand);
    rules.push({ id: t.id, requirement: t.requirement, observed, status, confidence, severity: pass ? undefined : t.severity });
    confidenceSum += confidence;
    if (!pass) {
      const evLabel = PHOTO_LABELS[i % PHOTO_LABELS.length];
      violationDetails.push({
        ruleId: t.id,
        severity: t.severity,
        title: `${t.requirement} requires verification`,
        observed,
        expected: t.requirement,
        evidenceLabel: evLabel,
        evidenceRef: `EVD-${(80000 + Math.floor(rand() * 19999)).toString()}`,
      });
      if (!worstSeverity || severityRank(t.severity) > severityRank(worstSeverity)) worstSeverity = t.severity;
    }
  });

  const avgConfidence = confidenceSum / templates.length;
  const failCount = rules.filter((r) => r.status === 'FAIL').length;
  const reviewCount = rules.filter((r) => r.status === 'REVIEW').length;
  const score = Math.round(
    (rules.filter((r) => r.status === 'PASS').length / rules.length) * 70 +
      avgConfidence * 30,
  );

  let status: Inspection['status'];
  let action: string | undefined;
  if (failCount > 0 && avgConfidence >= 0.7) {
    status = 'NON-COMPLIANT';
    action = 'Issue notice';
  } else if (avgConfidence >= 0.85 && failCount === 0 && reviewCount === 0) {
    status = 'COMPLIANT';
  } else {
    status = 'REVIEW REQUIRED';
    action = 'Assign reviewer';
  }

  const evidence: EvidenceItem[] = PHOTO_LABELS.map((label) => ({ label, status: 'Ready', source: capture }));

  return {
    score: Math.min(99, Math.max(28, score)),
    confidence: Math.round(avgConfidence * 100) / 100,
    status,
    severity: worstSeverity,
    action,
    rules,
    violationDetails,
    evidence,
  };
}

function severityRank(s: Severity) {
  return s === 'CRITICAL' ? 3 : s === 'MAJOR' ? 2 : 1;
}

export const PIPELINE_STAGES = [
  'Image quality',
  'OCR & text extraction',
  'Product identification',
  'Regulatory applicability',
  'Measurement',
  'Rule evaluation',
  'Evidence linking',
  'Final decision',
];

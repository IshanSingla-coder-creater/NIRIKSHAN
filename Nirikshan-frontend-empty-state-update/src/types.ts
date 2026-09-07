export type FinalStatus =
  | 'COMPLIANT'
  | 'NON-COMPLIANT'
  | 'REVIEW REQUIRED'
  | 'INSUFFICIENT EVIDENCE'
  | 'NOT APPLICABLE';

export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type RuleStatus = 'PASS' | 'REVIEW' | 'FAIL';
export type CaptureMethod = 'QR-PAIRED PHONE' | 'DIRECT UPLOAD';

export interface RuleResult {
  id: string;
  requirement: string;
  observed: string;
  status: RuleStatus;
  confidence: number;
  severity?: Severity;
}

export interface ViolationItem {
  ruleId: string;
  severity: Severity;
  title: string;
  observed: string;
  expected: string;
  evidenceLabel: string;
  evidenceRef: string;
}

export interface EvidenceItem {
  label: string;
  status: 'Ready' | 'Processing' | 'Flagged';
  source: CaptureMethod;
}

export interface Inspection {
  id: string;
  product: string;
  brand: string;
  category: string;
  manufacturer: string;
  sku: string;
  location: string;
  officer: string;
  date: string;
  status: FinalStatus;
  score: number;
  confidence: number;
  severity?: Severity;
  capture: CaptureMethod;
  violations: number;
  action?: string;
  ruleSet: string;
  rules: RuleResult[];
  violationDetails: ViolationItem[];
  evidence: EvidenceItem[];
  notes?: string;
}

export interface Product {
  name: string;
  brand: string;
  category: string;
  manufacturer: string;
  inspections: number;
  violations: number;
  lastStatus: FinalStatus;
  lastDate: string;
}

export type UserRole = 'Inspector' | 'Reviewer' | 'Administrator';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  region: string;
  email: string;
  status: 'Active' | 'Invited';
  initials: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ReportEntry {
  id: string;
  inspectionId: string;
  product: string;
  generatedBy: string;
  timestamp: string;
}

export interface RegulationEntry {
  id: string;
  title: string;
  summary: string;
  section: string;
}

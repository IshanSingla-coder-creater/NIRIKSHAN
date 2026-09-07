import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight, AlertTriangle, Camera, CheckCircle2, ClipboardPlus, Download, Image as ImageIcon, Info,
} from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, CardTitle, PageHead, Button, EmptyState } from '../components/ui';
import { StatusBadge } from '../status';
import { useStore } from '../store';
import { useToast } from '../toast';
import type { FinalStatus, Inspection } from '../types';

const STATUS_CLASS: Record<FinalStatus, string> = {
  COMPLIANT: 'compliant',
  'NON-COMPLIANT': 'non-compliant',
  'REVIEW REQUIRED': 'review-required',
  'INSUFFICIENT EVIDENCE': 'insufficient-evidence',
  'NOT APPLICABLE': '',
};

const STATUS_MESSAGE: Record<FinalStatus, string> = {
  COMPLIANT: 'This inspection satisfies every evaluated regulatory rule at or above the automatic decision threshold.',
  'NON-COMPLIANT': 'One or more rule evaluations confirm a violation with high confidence. A compliance notice should be issued.',
  'REVIEW REQUIRED': 'Evidence confidence is below the automatic decision threshold. Human verification is required before this inspection is finalized.',
  'INSUFFICIENT EVIDENCE': 'Captured evidence does not meet the minimum required-view count. Recapture is required before a decision can be made.',
  'NOT APPLICABLE': 'This inspection does not fall under an applicable Legal Metrology rule set.',
};

type Tab = 'overview' | 'product' | 'evidence' | 'audit';

export function InspectionDetail() {
  const { id } = useParams();
  const push = useToast();
  const { state, reviewDecision, addReport } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [reporting, setReporting] = useState(false);
  const item = state.inspections.find((x) => x.id === id);
  const me = state.users.find((u) => u.name === state.currentUser);

  const auditForItem = useMemo(() => (item ? state.auditLog.filter((a) => a.target.includes(item.id)) : []), [state.auditLog, item]);

  if (!item)
    return (
      <Shell>
        <div className="page">
          <PageHead eyebrow="INSPECTION" title="Inspection details" />
          <Card>
            <EmptyState
              title="No inspection selected"
              detail="Start a new inspection to capture evidence and generate an evidence-backed decision."
              action={
                <Link to="/inspections/new">
                  <Button>
                    <ClipboardPlus size={16} /> Start inspection
                  </Button>
                </Link>
              }
            />
          </Card>
        </div>
      </Shell>
    );

  function exportJson() {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item!.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push('Inspection data exported', 'success');
  }

  function generateReport() {
    setReporting(true);
    setTimeout(() => {
      const timestamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      addReport({ id: `RPT-${Date.now()}`, inspectionId: item!.id, product: item!.product, generatedBy: state.currentUser, timestamp });
      const summary = buildReportText(item!);
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item!.id}-report.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setReporting(false);
      push('Report generated and downloaded', 'success');
    }, 500);
  }

  function decide(status: FinalStatus, note: string, action?: string) {
    reviewDecision(item!.id, status, { actor: state.currentUser, note, action });
    push(`${item!.id} marked ${status.toLowerCase()}`, 'success');
  }

  const canReview = me?.role !== 'Inspector' && (item.status === 'REVIEW REQUIRED' || item.status === 'INSUFFICIENT EVIDENCE');

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow={item.id} title={item.product}>
          <Button variant="secondary" onClick={exportJson}>
            <Download size={16} /> Export
          </Button>
          <Button onClick={generateReport} loading={reporting}>
            Generate report
          </Button>
        </PageHead>

        <div className={`decision ${STATUS_CLASS[item.status]}`}>
          <div>
            <StatusBadge status={item.status} />
            <h2>{item.status.charAt(0) + item.status.slice(1).toLowerCase()}</h2>
            <p>{STATUS_MESSAGE[item.status]}</p>
            <div className="decisionFacts">
              <span>
                <b>{item.score > 0 ? `${item.score}/100` : '—'}</b>Compliance score
              </span>
              <span>
                <b>{item.confidence > 0 ? item.confidence.toFixed(2) : '—'}</b>Confidence
              </span>
              <span>
                <b>{item.ruleSet}</b>Rule set
              </span>
              <span>
                <b>{item.date}</b>Inspection date
              </span>
            </div>
            {canReview && (
              <div className="reviewActions">
                <Button variant="secondary" onClick={() => decide('COMPLIANT', 'Reviewer override')}>
                  Mark compliant
                </Button>
                <Button variant="danger" onClick={() => decide('NON-COMPLIANT', 'Confirmed violation', 'Issue notice')}>
                  Mark non-compliant
                </Button>
                <Button variant="secondary" onClick={() => decide('INSUFFICIENT EVIDENCE', 'Requested recapture', 'Recapture required')}>
                  Request recapture
                </Button>
              </div>
            )}
          </div>
          <div className="decisionAside">
            <p>CAPTURE SOURCE</p>
            <b>
              <Camera size={16} />
              {item.capture}
            </b>
            <Link to={`/inspections/${item.id}/evidence`}>
              Open evidence workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="tabs">
          <button className={tab === 'overview' ? 'selected' : ''} onClick={() => setTab('overview')}>
            Compliance overview
          </button>
          <button className={tab === 'product' ? 'selected' : ''} onClick={() => setTab('product')}>
            Product information
          </button>
          <button className={tab === 'evidence' ? 'selected' : ''} onClick={() => setTab('evidence')}>
            Evidence ({item.evidence.length})
          </button>
          <button className={tab === 'audit' ? 'selected' : ''} onClick={() => setTab('audit')}>
            Audit trail
          </button>
        </div>

        {tab === 'overview' && <OverviewTab item={item} />}
        {tab === 'product' && <ProductTab item={item} />}
        {tab === 'evidence' && <EvidenceTab item={item} />}
        {tab === 'audit' && <AuditTab entries={auditForItem} />}
      </div>
    </Shell>
  );
}

function buildReportText(item: Inspection) {
  const lines = [
    `NIRIKSHAN INSPECTION REPORT`,
    `============================`,
    `Inspection: ${item.id}`,
    `Product: ${item.product} (${item.brand})`,
    `Category: ${item.category}`,
    `Manufacturer: ${item.manufacturer}`,
    `Officer: ${item.officer}`,
    `Date: ${item.date}`,
    `Rule set: ${item.ruleSet}`,
    ``,
    `DECISION: ${item.status}`,
    `Compliance score: ${item.score}/100`,
    `Confidence: ${item.confidence}`,
    ``,
    `RULE-BY-RULE RESULTS`,
    ...item.rules.map((r) => `- [${r.status}] ${r.id} ${r.requirement} — observed: ${r.observed} (confidence ${r.confidence.toFixed(2)})`),
    ``,
    `VIOLATIONS`,
    ...(item.violationDetails.length ? item.violationDetails.map((v) => `- [${v.severity}] ${v.title} — ${v.observed}`) : ['None recorded.']),
  ];
  return lines.join('\n');
}

function OverviewTab({ item }: { item: Inspection }) {
  const heightRule = item.rules.find((r) => r.id === 'LMPC-08');
  return (
    <div className="gridMain">
      <div>
        <Card>
          <CardTitle title="Rule-by-rule compliance matrix" subtitle="All determinations trace to evidence and cited regulatory sources." />
          <RuleTable rules={item.rules} />
          <div className="confidenceNote">
            <Info size={17} />
            <span>
              <b>Confidence is an evidence-quality signal, not a legal judgment.</b> Prototype routing: ≥0.85 auto-proceed · 0.65–0.849 review · &lt;0.65 recapture.
            </span>
          </div>
        </Card>
        <Card className="violations">
          <CardTitle title="Normalized violations" subtitle="Actionable observations linked to regulatory rules." />
          {item.violationDetails.length ? (
            <div className="violationList">
              {item.violationDetails.map((v) => (
                <div className="violation" key={v.ruleId}>
                  <span className={`severity ${v.severity.toLowerCase()}`}>{v.severity}</span>
                  <div>
                    <h3>{v.title}</h3>
                    <p>
                      <b>Observed:</b> {v.observed} · <b>Expected:</b> {v.expected}
                    </p>
                    <small>
                      {v.ruleId} · Source: {v.evidenceLabel} · Evidence {v.evidenceRef}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="noViolations">No violations recorded for this inspection.</p>
          )}
        </Card>
      </div>
      <div className="sideStack">
        {heightRule && <Measurement rule={heightRule} />}
        <Card>
          <CardTitle title="Evidence coverage" subtitle={`${item.evidence.length} original evidence files`} />
          <div className="thumbs">
            {item.evidence.map((e, i) => (
              <div key={e.label}>
                <div className={`photo p${i % 4} ${e.status === 'Flagged' ? 'flagged' : ''}`}>
                  <ImageIcon size={20} />
                </div>
                <b>{e.label}</b>
                <small>
                  {e.status} · {e.source}
                </small>
              </div>
            ))}
          </div>
          <Link className="fullLink" to={`/inspections/${item.id}/evidence`}>
            Open evidence viewer <ArrowRight size={15} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function RuleTable({ rules }: { rules: Inspection['rules'] }) {
  if (!rules.length) return <p className="noViolations">No rules were evaluated — evidence was insufficient to proceed.</p>;
  return (
    <div className="scroll">
      <table className="rules">
        <thead>
          <tr>
            <th>Rule &amp; requirement</th>
            <th>Observed value</th>
            <th>Status</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id}>
              <td>
                <b>{r.id}</b>
                <small>{r.requirement}</small>
              </td>
              <td>{r.observed}</td>
              <td>
                <span className={`rule ${r.status.toLowerCase()}`}>
                  {r.status === 'PASS' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {r.status}
                </span>
              </td>
              <td>{r.confidence.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Measurement({ rule }: { rule: Inspection['rules'][number] }) {
  const match = rule.observed.match(/([\d.]+)/);
  const value = match ? match[1] : '—';
  return (
    <Card className="measurement">
      <p className="eyebrow">METROLOGY MEASUREMENT</p>
      <h3>Declaration character height</h3>
      <div className="measureValue">
        {value} <span>mm ± 0.3 mm</span>
      </div>
      <div className="measurePlot">
        <div className="labelLine" />
        <span>Observed range</span>
        <i />
        <b>Required ≥ 2.0 mm</b>
      </div>
      <div className="measureFacts">
        <span>
          Confidence <b>{rule.confidence.toFixed(2)}</b>
        </span>
        <span>
          Calibration <b>ArUco reference marker</b>
        </span>
        <span>
          Perspective <b>{rule.status === 'PASS' ? 'Good' : 'Marginal'}</b>
        </span>
      </div>
      {rule.status !== 'PASS' && (
        <div className="measureWarn">
          <AlertTriangle size={16} />
          <span>
            <b>Review required.</b> Measurement uncertainty overlaps the legal threshold.
          </span>
        </div>
      )}
    </Card>
  );
}

function ProductTab({ item }: { item: Inspection }) {
  const rows: [string, string][] = [
    ['Product name', item.product],
    ['Brand', item.brand],
    ['Category', item.category],
    ['Manufacturer / packer', item.manufacturer],
    ['SKU / batch', item.sku],
    ['Location', item.location],
    ['Inspecting officer', item.officer],
    ['Inspection date', item.date],
    ['Capture method', item.capture],
  ];
  return (
    <Card style={{ marginTop: 18, maxWidth: 720 }}>
      <CardTitle title="Product information" subtitle="Declared and captured product identity." />
      <div className="evidenceMeta">
        <dl>
          {rows.flatMap(([k, v]) => [
            <dt key={`${k}-k`}>{k}</dt>,
            <dd key={`${k}-v`}>{v || '—'}</dd>,
          ])}
        </dl>
        {item.notes && (
          <>
            <p className="eyebrow">INSPECTION NOTES</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{item.notes}</p>
          </>
        )}
      </div>
    </Card>
  );
}

function EvidenceTab({ item }: { item: Inspection }) {
  return (
    <Card style={{ marginTop: 18 }}>
      <CardTitle title={`Evidence (${item.evidence.length})`} subtitle={`Captured via ${item.capture.toLowerCase()}`} />
      <div className="thumbs" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {item.evidence.map((e, i) => (
          <div key={e.label}>
            <div className={`photo p${i % 4} ${e.status === 'Flagged' ? 'flagged' : ''}`} style={{ height: 110 }}>
              <ImageIcon size={26} />
            </div>
            <b>{e.label}</b>
            <small>
              {e.status} · {e.source}
            </small>
          </div>
        ))}
      </div>
      <Link className="fullLink" to={`/inspections/${item.id}/evidence`}>
        Open full evidence viewer <ArrowRight size={15} />
      </Link>
    </Card>
  );
}

function AuditTab({ entries }: { entries: { id: string; actor: string; action: string; target: string; timestamp: string }[] }) {
  if (!entries.length)
    return (
      <Card style={{ marginTop: 18 }}>
        <EmptyState title="No audit activity yet" detail="Actions taken on this inspection will be recorded here." />
      </Card>
    );
  return (
    <Card style={{ marginTop: 18 }}>
      <CardTitle title="Audit trail" subtitle="Immutable record of every action taken on this inspection." />
      <div className="timeline">
        {entries.map((e) => (
          <div className="row" key={e.id}>
            <span className="dot" />
            <div>
              <b>{e.action}</b>
              <small>
                {e.actor} · {e.timestamp}
              </small>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

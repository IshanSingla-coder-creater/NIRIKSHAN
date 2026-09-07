import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, ChevronRight, Download, Expand, FolderOpen, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button, EmptyState } from '../components/ui';
import { useStore } from '../store';
import type { Inspection } from '../types';

export function Evidence() {
  const { id } = useParams();
  const { state } = useStore();

  if (id) {
    const item = state.inspections.find((x) => x.id === id);
    if (!item)
      return (
        <Shell>
          <div className="page">
            <PageHead eyebrow="EVIDENCE WORKSPACE" title="Evidence not found" />
            <Card>
              <EmptyState title="No evidence to show" detail="This inspection could not be found." />
            </Card>
          </div>
        </Shell>
      );
    return <EvidenceViewer inspectionId={item.id} />;
  }

  const withEvidence = state.inspections.filter((i) => i.evidence.length > 0);

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="EVIDENCE WORKSPACE" title="Evidence repository" subtitle="All captured product evidence, grouped by inspection." />
        {withEvidence.length === 0 ? (
          <Card>
            <EmptyState
              title="No evidence uploaded"
              detail="Upload product images directly or begin a QR-paired phone capture session."
              action={
                <Link to="/inspections/new">
                  <Button>
                    <Camera size={16} /> Start capture
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <Card className="directory">
            {withEvidence.map((i) => (
              <Link to={`/inspections/${i.id}/evidence`} key={i.id} className="directoryRow" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rowIcon">
                  <FolderOpen />
                </div>
                <div className="body">
                  <b>
                    {i.product} <small style={{ display: 'inline', color: 'var(--text-muted)' }}>· {i.id}</small>
                  </b>
                  <small>
                    {i.brand} · {i.category} · {i.officer}
                  </small>
                </div>
                <div className="meta">
                  <span>
                    <b>{i.evidence.length}</b> files
                  </span>
                  <span>{i.capture}</span>
                </div>
                <ChevronRight size={17} color="var(--text-muted)" />
              </Link>
            ))}
          </Card>
        )}
      </div>
    </Shell>
  );
}

function EvidenceViewer({ inspectionId }: { inspectionId: string }) {
  const { state } = useStore();
  const item = state.inspections.find((x) => x.id === inspectionId)!;
  const [active, setActive] = useState(0);
  const evidence = item.evidence[active] ?? item.evidence[0];
  const relatedRule = evidence ? item.rules.find((r) => item.violationDetails.some((v) => v.evidenceLabel === evidence.label && v.ruleId === r.id)) : undefined;

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow={item.id} title={`Evidence · ${item.product}`}>
          <Button variant="secondary">
            <Download size={16} /> Export originals
          </Button>
        </PageHead>
        <div className="evidenceLayout">
          <Card className="evidenceImage">
            <div className="imgCanvas">
              {relatedRule && (
                <div className="cropBox">
                  {relatedRule.id}
                  <small>flagged region</small>
                </div>
              )}
              <div className="overlayHint">{evidence?.label} · {evidence?.source}</div>
            </div>
            <div className="imageTools">
              <Button variant="secondary" className="sm">
                <Expand size={14} /> Zoom
              </Button>
              <Button variant="secondary" className="sm">
                <RotateCcw size={14} /> Rotate
              </Button>
              <Button variant="secondary" className="sm">
                <Download size={14} /> Original
              </Button>
            </div>
          </Card>
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <Card>
              <div className="thumbs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {item.evidence.map((e, i) => (
                  <div key={e.label} onClick={() => setActive(i)} style={{ cursor: 'pointer' }}>
                    <div className={`photo p${i % 4} ${i === active ? '' : ''}`} style={{ outline: i === active ? '2px solid var(--brand)' : e.status === 'Flagged' ? '2px solid var(--danger)' : 'none' }}>
                      <ImageIcon size={18} />
                    </div>
                    <b>{e.label}</b>
                    <small>{e.status}</small>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="evidenceMeta">
              <dl>
                <dt>File label</dt>
                <dd>{evidence?.label ?? '—'}</dd>
                <dt>Status</dt>
                <dd>{evidence?.status ?? '—'}</dd>
                <dt>Capture source</dt>
                <dd>{evidence?.source ?? '—'}</dd>
                <dt>Linked rule</dt>
                <dd>{relatedRule ? `${relatedRule.id} — ${relatedRule.status}` : 'No flagged rule'}</dd>
              </dl>
              <p className="eyebrow">EXTRACTED TEXT (OCR)</p>
              <div className="ocr">
                <p>{ocrSampleFor(evidence?.label, item)}</p>
              </div>
              <Button variant="secondary">Flag as unclear</Button>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ocrSampleFor(label: string | undefined, item: Inspection) {
  if (!label) return 'No text extracted.';
  if (label.includes('MRP')) return `MRP ₹ ... incl. of all taxes · Net Qty: see back panel · Mfd by ${item.manufacturer}`;
  if (label.includes('Back')) return `Consumer care: 1800-XXX-XXXX · Mfd: see front panel · Batch ${item.sku}`;
  return `${item.brand} · ${item.product} · Net quantity declaration detected.`;
}

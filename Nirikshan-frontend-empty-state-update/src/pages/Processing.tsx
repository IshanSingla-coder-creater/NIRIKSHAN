import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ClipboardPlus, Clock, ScanLine } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button, EmptyState } from '../components/ui';
import { useStore } from '../store';
import { generateInspectionResult, PIPELINE_STAGES } from '../engine';
import type { CaptureMethod, Inspection } from '../types';

interface DraftState {
  product: string;
  brand: string;
  category: string;
  manufacturer: string;
  sku: string;
  location: string;
  notes: string;
  capture: CaptureMethod;
  capturedCount: number;
}

const STEP_MS = 650;

export function Processing() {
  const { id } = useParams();
  const loc = useLocation();
  const nav = useNavigate();
  const { addInspection, state } = useStore();
  const draft = loc.state as DraftState | undefined;
  const [stageIndex, setStageIndex] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!draft || !id) return;
    const timers: number[] = [];
    PIPELINE_STAGES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStageIndex(i + 1), (i + 1) * STEP_MS));
    });
    timers.push(
      window.setTimeout(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        const result = generateInspectionResult(id, draft.capture, draft.capturedCount);
        const inspection: Inspection = {
          id,
          product: draft.product,
          brand: draft.brand || '—',
          category: draft.category || 'Uncategorized',
          manufacturer: draft.manufacturer || 'Not declared',
          sku: draft.sku || '—',
          location: draft.location || 'Not recorded',
          officer: state.currentUser,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: result.status,
          score: result.score,
          confidence: result.confidence,
          severity: result.severity,
          capture: draft.capture,
          violations: result.violationDetails.length,
          action: result.action,
          ruleSet: 'LMPC 2011',
          rules: result.rules,
          violationDetails: result.violationDetails,
          evidence: result.evidence,
          notes: draft.notes,
        };
        addInspection(inspection, state.currentUser);
        nav(`/inspections/${id}`, { replace: true });
      }, (PIPELINE_STAGES.length + 1) * STEP_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, id]);

  if (!draft || !id) {
    return (
      <Shell>
        <div className="page narrow">
          <PageHead eyebrow="PROCESSING" title="No active inspection" />
          <Card>
            <EmptyState
              title="Nothing is currently processing"
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
  }

  const pct = Math.round((stageIndex / PIPELINE_STAGES.length) * 100);

  return (
    <Shell>
      <div className="page narrow">
        <PageHead eyebrow={id} title={`Analyzing ${draft.product}`} />
        <Card className="processing">
          <div className="processingTop">
            <div className="pulse">
              <ScanLine size={30} />
            </div>
            <div>
              <h2>Building an evidence-backed decision</h2>
              <p>AI assists extraction and interpretation. The deterministic regulatory rule engine evaluates compliance.</p>
            </div>
            <strong>{pct}%</strong>
          </div>
          <div className="progressBar">
            <i style={{ width: `${pct}%` }} />
          </div>
          <Pipeline stageIndex={stageIndex} />
          <div className="qualityRow">
            <span>
              <CheckCircle2 size={15} /> Image quality {stageIndex > 0 ? 'passed' : 'pending'}
            </span>
            <span>
              <CheckCircle2 size={15} /> OCR confidence {stageIndex > 1 ? `${88 + (stageIndex % 7)}%` : '—'}
            </span>
            <span className={stageIndex < PIPELINE_STAGES.length ? 'wait' : ''}>
              <Clock size={15} /> {stageIndex < PIPELINE_STAGES.length ? PIPELINE_STAGES[stageIndex] : 'Finalizing decision'}
            </span>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function Pipeline({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="pipeline">
      {PIPELINE_STAGES.map((s, i) => (
        <div key={s} className={i < stageIndex ? 'done' : i === stageIndex ? 'active' : ''}>
          <span>{i < stageIndex ? <CheckCircle2 size={16} /> : i + 1}</span>
          <b>{s}</b>
          <small>{i < stageIndex ? 'Complete' : i === stageIndex ? 'In progress' : 'Pending'}</small>
        </div>
      ))}
    </div>
  );
}

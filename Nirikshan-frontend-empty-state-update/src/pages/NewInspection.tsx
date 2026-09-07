import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Clock, FileImage, RotateCcw, ScanLine, Upload, Wifi, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button } from '../components/ui';
import { useCaptureChannel } from '../capture';
import { PHOTO_LABELS } from '../data';
import { useToast } from '../toast';

const FIELDS = ['Product name', 'Brand', 'Category', 'Manufacturer / packer', 'SKU / batch', 'Location'] as const;
const STEPS = ['Inspection details', 'Capture method', 'Processing', 'Decision'];

interface DraftDetails {
  product: string; brand: string; category: string; manufacturer: string; sku: string; location: string; notes: string;
}

const DRAFT_KEY = 'nirikshan-inspection-draft';

export function NewInspection() {
  const nav = useNavigate();
  const push = useToast();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'qr' | 'upload'>('qr');
  const [details, setDetails] = useState<DraftDetails>({ product: '', brand: '', category: '', manufacturer: '', sku: '', location: '', notes: '' });
  const [error, setError] = useState(false);
  const [session, setSession] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const capture = useCaptureChannel(session);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<DraftDetails> & { files?: string[]; mode?: 'qr' | 'upload'; step?: number };
      if (parsed.product || parsed.brand || parsed.category || parsed.location || parsed.notes) {
        setDetails({
          product: parsed.product ?? '',
          brand: parsed.brand ?? '',
          category: parsed.category ?? '',
          manufacturer: parsed.manufacturer ?? '',
          sku: parsed.sku ?? '',
          location: parsed.location ?? '',
          notes: parsed.notes ?? '',
        });
      }
      if (parsed.mode) setMode(parsed.mode);
      if (typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 4) setStep(parsed.step);
    } catch {
      // ignore invalid draft
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({ ...details, mode, step });
    localStorage.setItem(DRAFT_KEY, payload);
  }, [details, mode, step]);

  function saveDraft() {
    const payload = JSON.stringify({ ...details, mode, step, files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })) });
    localStorage.setItem(DRAFT_KEY, payload);
    push('Draft saved locally', 'info');
  }

  function updateField(label: (typeof FIELDS)[number], value: string) {
    const key = ({ 'Product name': 'product', Brand: 'brand', Category: 'category', 'Manufacturer / packer': 'manufacturer', 'SKU / batch': 'sku', Location: 'location' } as const)[label];
    setDetails((d) => ({ ...d, [key]: value }));
  }

  function continueToCapture() {
    if (!details.product.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setStep(2);
  }

  function beginProcessing() {
    const capturedCount = mode === 'qr' ? capture.state.captured.length : Math.min(files.length, 4);
    if (capturedCount === 0) {
      push('Capture or upload at least one evidence photo before processing.', 'error');
      return;
    }
    const id = `INS-2026-${2000 + Math.floor(Math.random() * 7999)}`;
    nav(`/processing/${id}`, {
      state: {
        ...details,
        capture: mode === 'qr' ? 'QR-PAIRED PHONE' : 'DIRECT UPLOAD',
        capturedCount,
      },
    });
  }

  return (
    <Shell>
      <div className="page narrow">
        <PageHead eyebrow="NEW INSPECTION" title="Start new inspection">
          <Button variant="ghost" onClick={saveDraft}>
            Save draft
          </Button>
        </PageHead>
        <div className="stepper">
          {STEPS.map((s, i) => (
            <span className={i + 1 === step ? 'current' : i + 1 < step ? 'done' : ''} key={s}>
              <b>{i + 1}</b>
              {s}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <>
            <Card>
              <h2>Inspection details</h2>
              <p className="sub">Enter what you know. Product details can be completed from captured evidence.</p>
              <div className="formgrid">
                {FIELDS.map((x, i) => (
                  <label key={x}>
                    {x}
                    {i === 0 && <em>Required</em>}
                    <input
                      value={details[(['product', 'brand', 'category', 'manufacturer', 'sku', 'location'] as const)[i]]}
                      onChange={(e) => updateField(x, e.target.value)}
                      placeholder={i === 0 ? 'e.g., ABC Premium Basmati Rice' : `Enter ${x.toLowerCase()}`}
                    />
                    {i === 0 && error && <span className="fieldError">Product name is required to continue.</span>}
                  </label>
                ))}
                <label className="wide">
                  Inspection notes
                  <textarea
                    value={details.notes}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Record observed context, location conditions or a reason for inspection…"
                  />
                </label>
              </div>
            </Card>
            <div className="footerActions">
              <Button variant="secondary" onClick={() => nav('/inspections')}>
                Cancel
              </Button>
              <Button onClick={continueToCapture}>
                Continue to capture <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="captureChoices">
              <button onClick={() => setMode('qr')} className={mode === 'qr' ? 'chosen' : ''}>
                <div className="choiceIcon">
                  <ScanLine />
                </div>
                <h2>Capture with phone</h2>
                <p>Pair an inspection phone to capture calibrated, multi-view evidence in the field.</p>
                <span>
                  QR-paired phone <ChevronRight size={16} />
                </span>
              </button>
              <button onClick={() => setMode('upload')} className={mode === 'upload' ? 'chosen' : ''}>
                <div className="choiceIcon">
                  <Upload />
                </div>
                <h2>Upload images directly</h2>
                <p>Upload multiple product images from this device. This evidence source remains fully supported.</p>
                <span>
                  Direct upload <ChevronRight size={16} />
                </span>
              </button>
            </div>
            {mode === 'qr' ? (
              <QRSession
                session={session}
                setSession={setSession}
                captured={capture.state.captured}
                connected={capture.state.connected}
                setCaptureState={capture.setState}
              />
            ) : (
              <UploadPanel files={files} setFiles={setFiles} />
            )}
            <div className="footerActions">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={beginProcessing}>
                Begin processing <ArrowRight size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

function QRSession({
  session,
  setSession,
  captured,
  connected,
  setCaptureState,
}: {
  session?: string;
  setSession: (s: string) => void;
  captured: string[];
  connected: boolean;
  setCaptureState: React.Dispatch<React.SetStateAction<{ connected: boolean; captured: string[] }>>;
}) {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const simTimers = useRef<number[]>([]);

  useEffect(() => {
    if (!session) return;
    setSecondsLeft(600);
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [session]);

  useEffect(() => () => simTimers.current.forEach((t) => window.clearTimeout(t)), []);

  function createSession() {
    setSession(`NRK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`);
    setCaptureState({ connected: false, captured: [] });
  }

  function simulatePhone() {
    setCaptureState((s) => ({ ...s, connected: true }));
    PHOTO_LABELS.forEach((label, i) => {
      const t = window.setTimeout(() => {
        setCaptureState((s) => (s.captured.includes(label) ? s : { ...s, captured: [...s.captured, label] }));
      }, 650 * (i + 1));
      simTimers.current.push(t);
    });
  }

  if (!session)
    return (
      <Card className="qrSession">
        <div className="choiceIcon">
          <ScanLine />
        </div>
        <div>
          <span className="eyebrow">QR-PAIRED SESSION</span>
          <h2>Create a phone capture session</h2>
          <p>Generate a secure, time-limited QR code when you are ready to pair the inspection phone.</p>
        </div>
        <Button onClick={createSession}>
          <ScanLine size={16} /> Generate QR code
        </Button>
      </Card>
    );

  const url = `${window.location.origin}/capture/${session}`;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Card className="qrSession">
      <div className="qr">
        <QRCodeSVG value={url} size={166} />
      </div>
      <div>
        <span className="eyebrow">QR-PAIRED SESSION</span>
        <h2>{connected ? 'Phone connected — capture views now' : 'Ready to connect an inspection phone'}</h2>
        <p>
          Scan this QR code with the inspection phone, or open <a href={url} target="_blank" rel="noreferrer">this link</a> in another tab to
          simulate the phone. Pair once, then capture every required product surface.
        </p>
        <div className="sessionMeta">
          <span className={connected ? 'live' : ''}>
            <Wifi size={16} /> {connected ? 'Connected' : 'Waiting for phone'}
          </span>
          <span>
            <Clock size={16} /> Expires in {mm}:{ss}
          </span>
          <span>
            <ScanLine size={16} />
            {session}
          </span>
        </div>
        <div className="capturedStrip">
          {PHOTO_LABELS.map((label) => (
            <span key={label} style={{ opacity: captured.includes(label) ? 1 : 0.35 }}>
              {captured.includes(label) ? '✓' : '○'} {label}
            </span>
          ))}
        </div>
        <p className="hint">{captured.length}/4 views captured{captured.length > 0 && captured.length < 3 ? ' — below the minimum for automatic decisioning' : ''}.</p>
      </div>
      <div style={{ display: 'grid', gap: 8, marginLeft: 'auto' }}>
        {!connected && (
          <Button variant="secondary" onClick={simulatePhone}>
            <Wifi size={16} /> Simulate phone
          </Button>
        )}
        <Button variant="secondary" onClick={createSession}>
          <RotateCcw size={16} /> Regenerate
        </Button>
      </div>
    </Card>
  );
}

function UploadPanel({ files, setFiles }: { files: File[]; setFiles: React.Dispatch<React.SetStateAction<File[]>> }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list)].slice(0, 20));
  }

  return (
    <Card
      className={`uploadPanel ${drag ? 'drag' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      <Upload size={28} />
      <h2>Drop image evidence here</h2>
      <p>PNG, JPG or HEIC · Up to 20 images · Original files retained for evidence integrity</p>
      <Button onClick={() => inputRef.current?.click()}>
        <FileImage size={16} /> Browse files
      </Button>
      <input ref={inputRef} type="file" multiple accept="image/*" hidden onChange={(e) => addFiles(e.target.files)} />
      {files.length > 0 && (
        <div className="fileChips">
          {files.map((f, i) => (
            <span key={f.name + i}>
              <FileImage size={12} /> {f.name}
              <X size={12} onClick={() => setFiles((fs) => fs.filter((_, idx) => idx !== i))} style={{ cursor: 'pointer' }} />
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

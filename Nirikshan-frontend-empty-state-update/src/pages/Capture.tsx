import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Image as ImageIcon, RotateCcw, Wifi, X } from 'lucide-react';
import { useCaptureChannel } from '../capture';
import { PHOTO_LABELS } from '../data';

const SURFACES = ['Front', 'Back', 'Side', 'MRP', 'Other'];

export function Capture() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const { state, send } = useCaptureChannel(sessionId);
  const [surface, setSurface] = useState(0);

  useEffect(() => {
    send({ type: 'connected' });
    const t = setInterval(() => send({ type: 'connected' }), 4000);
    return () => clearInterval(t);
  }, [send]);

  const remaining = PHOTO_LABELS.filter((l) => !state.captured.includes(l));
  const nextLabel = remaining[0];
  const done = state.captured.length;

  function shoot() {
    if (!nextLabel) return;
    send({ type: 'photo', label: nextLabel });
  }

  return (
    <div className="captureMobile">
      <header>
        <button className="icon" onClick={() => nav('/inspections/new')}>
          <X />
        </button>
        <div>
          <b>Inspection capture</b>
          <small>{sessionId}</small>
        </div>
        <span className="live">
          <Wifi size={15} /> Connected
        </span>
      </header>
      <div className="cameraView">
        <div className="cameraText">
          <span>{done >= 4 ? 'ALL VIEWS CAPTURED' : 'GOOD CAPTURE'}</span>
          <p>{nextLabel ? 'Hold steady · label is in focus' : 'Return to desktop to continue'}</p>
        </div>
        <div className="frame">
          <i />
          <i />
          <i />
          <i />
        </div>
        {nextLabel && <div className="cameraTag">{nextLabel}</div>}
      </div>
      <section className="captureBottom">
        <div className="viewProgress">
          <div>
            <b>{done} / 4 required views captured</b>
            <small>Photos upload automatically to desktop session</small>
          </div>
          <div className="miniViews">
            {PHOTO_LABELS.map((p, i) => (
              <span className={state.captured.includes(p) ? 'done' : ''} key={p}>
                {state.captured.includes(p) ? <CheckCircle2 size={15} /> : i + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="surfaceBtns">
          {SURFACES.map((x, i) => (
            <button className={i === surface ? 'selected' : ''} key={x} onClick={() => setSurface(i)}>
              {x}
            </button>
          ))}
        </div>
        <div className="captureControls">
          <button className="gallery">
            <ImageIcon />
          </button>
          <button className="shutter" onClick={shoot} disabled={!nextLabel}>
            <i />
          </button>
          <button className="flip">
            <RotateCcw />
          </button>
        </div>
      </section>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

export interface CaptureState {
  connected: boolean;
  captured: string[];
}

type Message = { type: 'connected' } | { type: 'photo'; label: string } | { type: 'reset' };

function channelName(sessionId: string) {
  return `nirikshan-capture-${sessionId}`;
}

/** Syncs QR-pair capture progress between two tabs (desktop session + phone capture page) via BroadcastChannel. */
export function useCaptureChannel(sessionId: string | undefined) {
  const [state, setState] = useState<CaptureState>({ connected: false, captured: [] });
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!sessionId || typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(channelName(sessionId));
    channelRef.current = bc;
    bc.onmessage = (ev: MessageEvent<Message>) => {
      const msg = ev.data;
      if (msg.type === 'connected') setState((s) => ({ ...s, connected: true }));
      else if (msg.type === 'photo') setState((s) => (s.captured.includes(msg.label) ? s : { ...s, captured: [...s.captured, msg.label] }));
      else if (msg.type === 'reset') setState({ connected: false, captured: [] });
    };
    return () => bc.close();
  }, [sessionId]);

  const send = useCallback((msg: Message) => channelRef.current?.postMessage(msg), []);

  return { state, send, setState };
}

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

interface ToastItem { id: number; message: string; tone: 'success' | 'error' | 'info' }
type Push = (message: string, tone?: ToastItem['tone']) => void;

const ToastContext = createContext<Push | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback<Push>((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toastStack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.tone === 'success' ? <CheckCircle2 size={16} /> : t.tone === 'error' ? <XCircle size={16} /> : <Info size={16} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

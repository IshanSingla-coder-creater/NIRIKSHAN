import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { auditLogSeed, inspections as seedInspections, users as seedUsers } from './data';
import type { AuditEntry, FinalStatus, Inspection, ReportEntry, UserAccount, UserRole } from './types';

const STORAGE_KEY = 'nirikshan.state.v2';

export interface PersistedState {
  inspections: Inspection[];
  users: UserAccount[];
  auditLog: AuditEntry[];
  reports: ReportEntry[];
  theme: 'light' | 'dark';
  currentUser: string;
}

function seedState(theme: PersistedState['theme'] = 'light'): PersistedState {
  return { inspections: seedInspections, users: seedUsers, auditLog: auditLogSeed, reports: [], theme, currentUser: 'Priya Sharma' };
}

function loadInitial(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return { ...seedState(), ...parsed };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return seedState();
}

function formatNow() {
  const d = new Date();
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function auditEntry(actor: string, action: string, target: string): AuditEntry {
  return { id: `AUD-${Date.now()}-${Math.floor(Math.random() * 999)}`, actor, action, target, timestamp: formatNow() };
}

type Action =
  | { type: 'ADD_INSPECTION'; inspection: Inspection; actor: string }
  | { type: 'REVIEW_DECISION'; id: string; status: FinalStatus; actor: string; note?: string; action?: string }
  | { type: 'ADD_REPORT'; report: ReportEntry }
  | { type: 'ADD_USER'; user: UserAccount; actor: string }
  | { type: 'ADD_AUDIT'; entry: AuditEntry }
  | { type: 'SET_THEME'; theme: PersistedState['theme'] }
  | { type: 'SET_USER'; name: string }
  | { type: 'RESET_DEMO' };

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'ADD_INSPECTION':
      return {
        ...state,
        inspections: [action.inspection, ...state.inspections],
        auditLog: [auditEntry(action.actor, 'Completed inspection processing', `${action.inspection.id} · ${action.inspection.product}`), ...state.auditLog],
      };
    case 'REVIEW_DECISION': {
      const inspections = state.inspections.map((i) => (i.id === action.id ? { ...i, status: action.status, action: action.action } : i));
      const label = action.status.charAt(0) + action.status.slice(1).toLowerCase();
      return {
        ...state,
        inspections,
        auditLog: [auditEntry(action.actor, `Set status to ${label}`, action.id + (action.note ? ` · ${action.note}` : '')), ...state.auditLog],
      };
    }
    case 'ADD_REPORT':
      return { ...state, reports: [action.report, ...state.reports], auditLog: [auditEntry(state.currentUser, 'Generated report', `${action.report.inspectionId} · ${action.report.product}`), ...state.auditLog] };
    case 'ADD_USER':
      return { ...state, users: [action.user, ...state.users], auditLog: [auditEntry(action.actor, 'Added account', `${action.user.id} · ${action.user.name}`), ...state.auditLog] };
    case 'ADD_AUDIT':
      return { ...state, auditLog: [action.entry, ...state.auditLog] };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_USER':
      return { ...state, currentUser: action.name };
    case 'RESET_DEMO':
      return seedState(state.theme);
    default:
      return state;
  }
}

interface Ctx {
  state: PersistedState;
  addInspection: (inspection: Inspection, actor?: string) => void;
  reviewDecision: (id: string, status: FinalStatus, opts?: { actor?: string; note?: string; action?: string }) => void;
  addReport: (report: ReportEntry) => void;
  addUser: (user: UserAccount, actor?: string) => void;
  logAction: (action: string, target: string, actor?: string) => void;
  setTheme: (t: PersistedState['theme']) => void;
  setUser: (name: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — demo continues in-memory */
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const addInspection = useCallback((inspection: Inspection, actor = 'System') => dispatch({ type: 'ADD_INSPECTION', inspection, actor }), []);
  const reviewDecision = useCallback(
    (id: string, status: FinalStatus, opts?: { actor?: string; note?: string; action?: string }) =>
      dispatch({ type: 'REVIEW_DECISION', id, status, actor: opts?.actor ?? 'Reviewer', note: opts?.note, action: opts?.action }),
    [],
  );
  const addReport = useCallback((report: ReportEntry) => dispatch({ type: 'ADD_REPORT', report }), []);
  const addUser = useCallback((user: UserAccount, actor = 'Administrator') => dispatch({ type: 'ADD_USER', user, actor }), []);
  const logAction = useCallback((action: string, target: string, actor = 'System') => dispatch({ type: 'ADD_AUDIT', entry: auditEntry(actor, action, target) }), []);
  const setTheme = useCallback((theme: PersistedState['theme']) => dispatch({ type: 'SET_THEME', theme }), []);
  const setUser = useCallback((name: string) => dispatch({ type: 'SET_USER', name }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);

  const value = useMemo<Ctx>(
    () => ({ state, addInspection, reviewDecision, addReport, addUser, logAction, setTheme, setUser, resetDemo }),
    [state, addInspection, reviewDecision, addReport, addUser, logAction, setTheme, setUser, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

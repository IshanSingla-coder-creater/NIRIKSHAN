import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { Shell } from '../components/Shell';
import { PageHead, Button } from '../components/ui';
import { ActionTable } from '../components/ActionTable';
import { useStore } from '../store';
import { actionQueue } from '../selectors';
import type { Inspection } from '../types';

const FILTERS = ['All', 'Review required', 'Insufficient evidence', 'High severity', 'Assigned to me'] as const;

export function Reviews() {
  const { state } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const rows = useMemo(() => {
    const queue = actionQueue(state.inspections);
    const byFilter: Record<(typeof FILTERS)[number], (i: Inspection) => boolean> = {
      All: () => true,
      'Review required': (i) => i.status === 'REVIEW REQUIRED',
      'Insufficient evidence': (i) => i.status === 'INSUFFICIENT EVIDENCE',
      'High severity': (i) => i.severity === 'CRITICAL' || i.severity === 'MAJOR',
      'Assigned to me': (i) => i.officer === state.currentUser,
    };
    return queue.filter(byFilter[filter]);
  }, [state.inspections, state.currentUser, filter]);

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="HUMAN REVIEW" title="Review queue" subtitle="Cases routed for verification before a decision is finalized.">
          <Button variant="secondary">
            <Filter size={16} /> Filter cases
          </Button>
        </PageHead>
        <div className="filterChips">
          {FILTERS.map((f) => (
            <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <ActionTable rows={rows} emptyTitle="No cases in this view" emptyDetail="Cases that need a decision or intervention will appear here." />
      </div>
    </Shell>
  );
}

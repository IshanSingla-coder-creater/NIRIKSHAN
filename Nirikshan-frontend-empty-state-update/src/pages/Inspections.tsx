import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardPlus, Search, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button } from '../components/ui';
import { ActionTable } from '../components/ActionTable';
import { useStore } from '../store';
import type { FinalStatus, Inspection } from '../types';
import { useToast } from '../toast';

const STATUS_FILTERS: (FinalStatus | 'All')[] = ['All', 'COMPLIANT', 'NON-COMPLIANT', 'REVIEW REQUIRED', 'INSUFFICIENT EVIDENCE'];
const PAGE_SIZE = 8;
type SortKey = 'date' | 'id' | 'status' | 'score';

function toCsv(rows: Inspection[]) {
  const header = ['ID', 'Product', 'Brand', 'Category', 'Officer', 'Date', 'Status', 'Score', 'Confidence'];
  const lines = rows.map((r) => [r.id, r.product, r.brand, r.category, r.officer, r.date, r.status, r.score, r.confidence].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  return [header.join(','), ...lines].join('\n');
}

export function Inspections() {
  const { state } = useStore();
  const push = useToast();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = state.inspections.filter((x) => `${x.product} ${x.id} ${x.brand} ${x.manufacturer}`.toLowerCase().includes(query.toLowerCase()));
    if (status !== 'All') rows = rows.filter((r) => r.status === status);
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === 'id') cmp = a.id.localeCompare(b.id);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else cmp = a.score - b.score;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [state.inspections, query, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function exportCsv() {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nirikshan-inspections-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    push(`Exported ${filtered.length} inspections to CSV`, 'success');
  }

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="INSPECTION REPOSITORY" title="Inspections" subtitle={`${state.inspections.length} inspections on file across all officers`}>
          <Link to="/inspections/new">
            <Button>
              <ClipboardPlus size={17} /> New inspection
            </Button>
          </Link>
        </PageHead>

        <Card className="filters">
          <label className="search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, product, brand, manufacturer…"
            />
          </label>
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </Button>
        </Card>

        <div className="filterChips">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={status === s ? 'selected' : ''}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {pageRows.length === 0 ? (
          <ActionTable rows={[]} emptyTitle="No inspections match your filters" emptyDetail="Try a different search term or clear the status filter." />
        ) : (
          <Card className="tableCard">
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <SortableTh label="Inspection" active={sortKey === 'id'} dir={sortDir} onClick={() => toggleSort('id')} />
                    <th>Product &amp; category</th>
                    <th>Officer</th>
                    <SortableTh label="Date" active={sortKey === 'date'} dir={sortDir} onClick={() => toggleSort('date')} />
                    <SortableTh label="Status" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
                    <SortableTh label="Score" active={sortKey === 'score'} dir={sortDir} onClick={() => toggleSort('score')} />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <Link to={`/inspections/${i.id}`} className="id">
                          {i.id}
                        </Link>
                      </td>
                      <td>
                        <b>{i.product}</b>
                        <small>{i.category}</small>
                      </td>
                      <td>{i.officer}</td>
                      <td>{i.date}</td>
                      <td>
                        <StatusCell status={i.status} />
                      </td>
                      <td>{i.score > 0 ? `${i.score}/100` : '—'}</td>
                      <td>
                        <Link to={`/inspections/${i.id}`}>
                          <Button variant="secondary">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filtered.length > 0 && (
          <div className="pagination">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} inspections
            </span>
            <div>
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function SortableTh({ label, active, dir, onClick }: { label: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void }) {
  return (
    <th className="sortable" onClick={onClick}>
      {label}
      <span className="sortIcon">{active ? dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} /> : null}</span>
    </th>
  );
}

function StatusCell({ status }: { status: Inspection['status'] }) {
  const tone = status === 'COMPLIANT' ? 'success' : status === 'NON-COMPLIANT' ? 'danger' : status === 'REVIEW REQUIRED' ? 'warning' : 'muted';
  return <span className={`badge ${tone}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, CardTitle, PageHead, EmptyState } from '../components/ui';
import { useStore } from '../store';

export function AuditLog() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => state.auditLog.filter((a) => `${a.actor} ${a.action} ${a.target}`.toLowerCase().includes(query.toLowerCase())),
    [state.auditLog, query],
  );

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="AUDIT LOG" title="Audit log" subtitle="Immutable activity and decision history" />
        <Card className="filters">
          <label className="search">
            <Search size={17} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actor, action, target…" />
          </label>
        </Card>
        <Card>
          <CardTitle title="Activity" subtitle={`${filtered.length} of ${state.auditLog.length} entries`} />
          {filtered.length === 0 ? (
            <EmptyState title="No matching activity" detail="Try a different search term." />
          ) : (
            <div className="timeline">
              {filtered.map((a) => (
                <div className="row" key={a.id}>
                  <span className="dot" />
                  <div>
                    <b>
                      {a.actor} · {a.action}
                    </b>
                    <small>{a.target}</small>
                    <small>{a.timestamp}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}

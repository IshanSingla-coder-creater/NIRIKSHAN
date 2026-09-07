import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, EmptyState } from '../components/ui';
import { regulations } from '../data';

export function Regulatory() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => regulations.filter((r) => `${r.id} ${r.title} ${r.summary} ${r.section}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="REGULATORY KNOWLEDGE" title="Regulatory knowledge" subtitle="Search cited Legal Metrology rules and guidance" />
        <Card className="directory">
          <div className="directorySearch">
            <label className="search">
              <Search size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rule ID, requirement, section…" />
            </label>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No matching rules" detail="Try a different search term." />
          ) : (
            filtered.map((r) => (
              <div className="directoryRow" key={r.id}>
                <div className="rowIcon">
                  <BookOpen />
                </div>
                <div className="body">
                  <b>
                    {r.id} · {r.title}
                  </b>
                  <small>{r.summary}</small>
                </div>
                <div className="meta">
                  <span>{r.section}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </Shell>
  );
}

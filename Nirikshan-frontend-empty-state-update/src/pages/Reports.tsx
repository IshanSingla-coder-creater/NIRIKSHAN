import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, EmptyState, Button } from '../components/ui';
import { useStore } from '../store';

export function Reports() {
  const { state } = useStore();

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="REPORTS" title="Reports" subtitle="Formal, traceable inspection outputs generated from finalized decisions." />
        <Card className="directory">
          {state.reports.length === 0 ? (
            <EmptyState
              title="No reports yet"
              detail={'Open a finalized inspection and choose "Generate report" to create one.'}
              action={
                <Link to="/inspections">
                  <Button>View inspections</Button>
                </Link>
              }
            />
          ) : (
            state.reports.map((r) => (
              <Link to={`/inspections/${r.inspectionId}`} key={r.id} className="directoryRow" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rowIcon">
                  <FileText />
                </div>
                <div className="body">
                  <b>{r.product}</b>
                  <small>
                    {r.id} · {r.inspectionId}
                  </small>
                </div>
                <div className="meta">
                  <span>{r.generatedBy}</span>
                  <span>{r.timestamp}</span>
                </div>
              </Link>
            ))
          )}
        </Card>
      </div>
    </Shell>
  );
}

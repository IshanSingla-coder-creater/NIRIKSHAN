import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Package, Search } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button, EmptyState } from '../components/ui';
import { StatusBadge } from '../status';
import { useStore } from '../store';
import { productDirectory } from '../selectors';

export function Products() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const products = useMemo(() => productDirectory(state.inspections), [state.inspections]);
  const filtered = products.filter((p) => `${p.name} ${p.brand} ${p.manufacturer} ${p.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="PRODUCTS" title="Products" subtitle="Search products, recurring issues and compliance timelines">
          <Button variant="secondary">
            <Filter size={16} /> Filter
          </Button>
        </PageHead>
        <Card className="directory">
          <div className="directorySearch">
            <label className="search">
              <Search size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" />
            </label>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No products yet" detail="Products appear here automatically once inspections are recorded against them." />
          ) : (
            filtered.map((p) => (
              <Link to={`/inspections?q=${encodeURIComponent(p.name)}`} key={p.brand + p.name} className="directoryRow" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="rowIcon">
                  <Package />
                </div>
                <div className="body">
                  <b>{p.name}</b>
                  <small>
                    {p.brand} · {p.manufacturer} · {p.category}
                  </small>
                </div>
                <div className="meta">
                  <span>
                    <b>{p.inspections}</b> inspections
                  </span>
                  <span>
                    <b>{p.violations}</b> violations
                  </span>
                </div>
                <StatusBadge status={p.lastStatus} />
              </Link>
            ))
          )}
        </Card>
      </div>
    </Shell>
  );
}

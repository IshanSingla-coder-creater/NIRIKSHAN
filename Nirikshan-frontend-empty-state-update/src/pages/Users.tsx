import { useState } from 'react';
import { Search, UserRound, UserPlus } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, PageHead, Button, EmptyState } from '../components/ui';
import { useStore } from '../store';
import { useToast } from '../toast';
import type { UserRole } from '../types';

const ROLES: UserRole[] = ['Inspector', 'Reviewer', 'Administrator'];

export function Users() {
  const { state, addUser } = useStore();
  const push = useToast();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Inspector');
  const [region, setRegion] = useState('');

  const filtered = state.users.filter((u) => `${u.name} ${u.role} ${u.region} ${u.email}`.toLowerCase().includes(query.toLowerCase()));

  function create() {
    if (!name.trim()) {
      push('Enter a name before creating the account.', 'error');
      return;
    }
    const initials = name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    addUser(
      {
        id: `USR-${Math.floor(100 + Math.random() * 899)}`,
        name: name.trim(),
        role,
        region: region.trim() || 'Delhi HQ',
        email: `${name.trim().toLowerCase().replace(/\s+/g, '.')}@consumeraffairs.gov.in`,
        status: 'Invited',
        initials,
      },
      state.currentUser,
    );
    push(`Invited ${name.trim()} as ${role}`, 'success');
    setName('');
    setRegion('');
    setShowForm(false);
  }

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="USERS" title="User management" subtitle="Roles and access governance">
          <Button onClick={() => setShowForm((s) => !s)}>
            <UserPlus size={16} /> Create user
          </Button>
        </PageHead>

        {showForm && (
          <Card style={{ marginBottom: 16 }}>
            <div className="formgrid">
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Neha Kapoor" />
              </label>
              <label>
                Role
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Region
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., Delhi South" />
              </label>
            </div>
            <div className="footerActions">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={create}>Send invite</Button>
            </div>
          </Card>
        )}

        <Card className="directory">
          <div className="directorySearch">
            <label className="search">
              <Search size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" />
            </label>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No users match your search" detail="Try a different search term." />
          ) : (
            filtered.map((u) => (
              <div className="directoryRow" key={u.id}>
                <div className="rowIcon">
                  <UserRound />
                </div>
                <div className="body">
                  <b>{u.name}</b>
                  <small>
                    {u.email} · {u.region}
                  </small>
                </div>
                <div className="meta">
                  <span>{u.role}</span>
                </div>
                <span className={`badge ${u.status === 'Active' ? 'success' : 'warning'}`}>{u.status}</span>
              </div>
            ))
          )}
        </Card>
      </div>
    </Shell>
  );
}

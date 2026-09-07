import { useState } from 'react';
import { Moon, RotateCcw, Sun, UserRound } from 'lucide-react';
import { Shell } from '../components/Shell';
import { Card, CardTitle, PageHead, Button } from '../components/ui';
import { useStore } from '../store';
import { useToast } from '../toast';

export function Settings() {
  const { state, setTheme, resetDemo, setUser } = useStore();
  const push = useToast();
  const [confirming, setConfirming] = useState(false);

  function doReset() {
    resetDemo();
    setConfirming(false);
    push('Demo data reset to seed state', 'success');
  }

  return (
    <Shell>
      <div className="page narrow">
        <PageHead eyebrow="SETTINGS" title="Settings" subtitle="Workspace preferences and prototype configuration" />

        <Card style={{ marginBottom: 16 }}>
          <CardTitle title="Active session" subtitle="Switch which seeded account you are viewing the workspace as." />
          <div style={{ display: 'grid', gap: 8 }}>
            {state.users.map((u) => (
              <label
                key={u.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', background: u.name === state.currentUser ? 'var(--brand-soft)' : 'transparent' }}
              >
                <input type="radio" name="user" checked={u.name === state.currentUser} onChange={() => setUser(u.name)} />
                <UserRound size={16} />
                <div style={{ flex: 1 }}>
                  <b style={{ display: 'block', fontSize: 12.5 }}>{u.name}</b>
                  <small style={{ color: 'var(--text-muted)' }}>
                    {u.role} · {u.region}
                  </small>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <CardTitle title="Appearance" subtitle="Choose how Nirikshan looks on this device." />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant={state.theme === 'light' ? 'primary' : 'secondary'} onClick={() => setTheme('light')}>
              <Sun size={16} /> Light
            </Button>
            <Button variant={state.theme === 'dark' ? 'primary' : 'secondary'} onClick={() => setTheme('dark')}>
              <Moon size={16} /> Dark
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle title="Demo data" subtitle="This prototype persists state to your browser's local storage only." />
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>
            Resetting clears every inspection, report and account created during this session and restores the original seeded dataset.
          </p>
          {confirming ? (
            <div className="footerActions" style={{ justifyContent: 'flex-start' }}>
              <Button variant="danger" onClick={doReset}>
                Confirm reset
              </Button>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              <RotateCcw size={16} /> Reset demo data
            </Button>
          )}
        </Card>
      </div>
    </Shell>
  );
}

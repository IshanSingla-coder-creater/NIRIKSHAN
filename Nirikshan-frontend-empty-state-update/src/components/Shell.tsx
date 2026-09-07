import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardPlus, ClipboardList, ShieldCheck, Package, FolderOpen, FileText,
  ChartNoAxesCombined, BookOpen, Users, ScrollText, Settings, Search, Bell, HelpCircle, Menu, X,
  ChevronRight, Shield, MoreHorizontal, Sun, Moon, LogOut, UserRound,
} from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge } from '../status';

type NavItem = [string, string, React.ComponentType<{ size?: number }>];

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Overview', items: [['/dashboard', 'Dashboard', LayoutDashboard]] },
  {
    label: 'Inspection workflow',
    items: [
      ['/inspections/new', 'Start inspection', ClipboardPlus],
      ['/inspections', 'Inspections', ClipboardList],
      ['/reviews', 'Review queue', ShieldCheck],
      ['/evidence', 'Evidence repository', FolderOpen],
    ],
  },
  {
    label: 'Insights',
    items: [
      ['/reports', 'Reports', FileText],
      ['/analytics', 'Analytics', ChartNoAxesCombined],
    ],
  },
  {
    label: 'Governance',
    items: [
      ['/products', 'Products', Package],
      ['/regulatory', 'Regulatory knowledge', BookOpen],
    ],
  },
  {
    label: 'Administration',
    items: [
      ['/admin/users', 'Users & roles', Users],
      ['/admin/audit-log', 'Audit log', ScrollText],
      ['/settings', 'Settings', Settings],
    ],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap((g) => g.items);
const MOBILE_NAV: NavItem[] = [FLAT_NAV[0], FLAT_NAV[1], FLAT_NAV[2], FLAT_NAV[3], FLAT_NAV[8]];

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

export function Logo() {
  return (
    <div className="logo">
      <span className="logoMark">
        <Shield size={24} />
      </span>
      <span>
        NIRIKSHAN
        <small>LEGAL METROLOGY</small>
      </span>
    </div>
  );
}

function ThemeToggle() {
  const { state, setTheme } = useStore();
  return (
    <div className="themeToggle">
      <button className={state.theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')} title="Light mode">
        <Sun size={14} />
      </button>
      <button className={state.theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')} title="Dark mode">
        <Moon size={14} />
      </button>
    </div>
  );
}

function SearchBox() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const ref = useClickOutside(() => setOpen(false));

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.inspections.filter((i) => `${i.id} ${i.product} ${i.brand} ${i.manufacturer}`.toLowerCase().includes(q)).slice(0, 7);
  }, [query, state.inspections]);

  return (
    <div className="searchWrap" ref={ref}>
      <label className="search">
        <Search size={17} />
        <input
          placeholder="Search inspections, products…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </label>
      {open && query.trim() && (
        <div className="searchResults">
          {results.length ? (
            results.map((r) => (
              <Link
                key={r.id}
                to={`/inspections/${r.id}`}
                onClick={() => {
                  setOpen(false);
                  setQuery('');
                }}
              >
                <b>{r.product}</b>
                <small>
                  {r.id} · {r.brand} · {r.officer}
                </small>
              </Link>
            ))
          ) : (
            <div className="searchEmpty">No inspections match “{query}”.</div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationsMenu() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const recent = state.auditLog.slice(0, 8);
  return (
    <div className="popover" ref={ref}>
      <button className="icon notify" onClick={() => setOpen((o) => !o)}>
        <Bell size={19} />
        {recent.length > 0 && <i />}
      </button>
      {open && (
        <div className="popPanel">
          <div className="popHead">
            <b>Recent activity</b>
            <span>{state.auditLog.length} total</span>
          </div>
          <div className="popList">
            {recent.map((a) => (
              <div className="popRow" key={a.id}>
                <span className="popDot" style={{ background: 'var(--brand)' }} />
                <div>
                  <b>{a.action}</b>
                  <small>
                    {a.actor} · {a.target}
                  </small>
                  <small>{a.timestamp}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const nav = useNavigate();
  const me = state.users.find((u) => u.name === state.currentUser) ?? state.users[0];
  return (
    <div className="popover" ref={ref}>
      <button className="avatar" onClick={() => setOpen((o) => !o)} style={{ border: 0 }}>
        {me.initials}
      </button>
      {open && (
        <div className="popPanel userMenu">
          <div className="popHead">
            <b>{me.role}</b>
            <span>{me.region}</span>
          </div>
          <div className="popList">
            <div className="popRow" onClick={() => { setOpen(false); nav('/settings'); }}>
              <UserRound size={15} />
              <div>
                <b>Account settings</b>
              </div>
            </div>
            <div className="popRow" onClick={() => { setOpen(false); nav('/login'); }}>
              <LogOut size={15} />
              <div>
                <b>Sign out</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { state } = useStore();
  const me = state.users.find((u) => u.name === state.currentUser) ?? state.users[0];
  const current = FLAT_NAV.find(([p]) => (p === '/dashboard' ? loc.pathname === p : loc.pathname.startsWith(p)));
  const today = useMemo(() => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }), []);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  return (
    <div className="app">
      <div className={open ? 'sidebarBackdrop visible' : 'sidebarBackdrop'} onClick={() => setOpen(false)} />
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="sideHead">
          <Logo />
          <button className="icon mobileOnly" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {NAV_GROUPS.map((g) => (
            <React.Fragment key={g.label}>
              <div className="navLabel">{g.label}</div>
              {g.items.map(([p, label, Icon]) => (
                <NavLink key={p} to={p} end={p === '/dashboard'} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>
        <Link to="/settings" className="sideUser" style={{ textDecoration: 'none' }}>
          <div className="avatar">{me.initials}</div>
          <div>
            <strong>{me.role}</strong>
            <small>{me.region}</small>
          </div>
          <MoreHorizontal size={18} />
        </Link>
      </aside>
      <main>
        <header className="topbar">
          <button className="icon mobileOnly" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div className="crumb">
            <span>Workspace</span>
            <ChevronRight size={15} />
            <strong>{current?.[1] || 'Dashboard'}</strong>
          </div>
          <div className="topActions">
            <SearchBox />
            <NotificationsMenu />
            <span className="date">{today}</span>
            <ThemeToggle />
            <Link to="/regulatory" className="icon">
              <HelpCircle size={19} />
            </Link>
            <UserMenu />
          </div>
        </header>
        {children}
      </main>
      <div className="mobileNav">
        {MOBILE_NAV.map(([p, l, I]) => (
          <NavLink key={p} to={p}>
            <I size={18} />
            <small>{l.split(' ')[0]}</small>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

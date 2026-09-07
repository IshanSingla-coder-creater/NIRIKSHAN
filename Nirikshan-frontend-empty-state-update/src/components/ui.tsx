import React from 'react';
import { FolderOpen } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...p
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...p} disabled={p.disabled || loading} className={`btn ${variant} ${className}`}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  ...rest
}: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`card ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function PageHead({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pageHead">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="sub">{subtitle}</p>}
      </div>
      <div className="headActions">{children}</div>
    </div>
  );
}

export function CardTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="cardTitle">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Kpi({
  title,
  value,
  note,
  tone = 'blue',
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  note: string;
  tone?: string;
  icon: React.ComponentType<{ size?: number }>;
  trend?: { dir: 'up' | 'down'; label: string };
}) {
  return (
    <Card className="kpi">
      <div className={`kpiIcon ${tone}`}>
        <Icon size={17} />
      </div>
      <p>{title}</p>
      <strong>{value}</strong>
      <small>
        {trend ? (
          <span className={`trend ${trend.dir}`}>
            {trend.dir === 'up' ? '▲' : '▼'} {trend.label}
          </span>
        ) : (
          note
        )}
      </small>
    </Card>
  );
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  detail,
  action,
}: {
  icon?: React.ComponentType<{ size?: number }>;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="emptyState">
      <Icon size={27} />
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}

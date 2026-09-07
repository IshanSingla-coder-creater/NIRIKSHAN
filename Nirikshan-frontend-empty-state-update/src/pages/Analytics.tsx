import { useMemo } from 'react';
import { BarChart2, CheckCircle2, ChevronDown, Clock, Gauge, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from '../components/Shell';
import { Card, CardTitle, PageHead, Kpi, Button, EmptyState } from '../components/ui';
import { useStore } from '../store';
import { computeKpis, trendSeries } from '../selectors';

export function Analytics() {
  const { state } = useStore();
  const inspections = state.inspections;
  const kpis = useMemo(() => computeKpis(inspections), [inspections]);
  const trend = useMemo(() => trendSeries(inspections), [inspections]);

  const byCapture = useMemo(() => {
    const groups: Record<string, number[]> = { 'QR-PAIRED PHONE': [], 'DIRECT UPLOAD': [] };
    inspections.forEach((i) => {
      if (i.confidence > 0) groups[i.capture].push(i.confidence);
    });
    return Object.entries(groups)
      .filter(([, v]) => v.length)
      .map(([name, v]) => ({ name: name === 'QR-PAIRED PHONE' ? 'QR-paired phone' : 'Direct upload', value: Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) }));
  }, [inspections]);

  const complianceRate = kpis.total ? Math.round((kpis.compliant / kpis.total) * 100) : null;
  const reviewRate = kpis.total ? Math.round((kpis.review / kpis.total) * 100) : null;

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="PERFORMANCE & QUALITY" title="Analytics" subtitle="Rolling metrics across every recorded inspection.">
          <Button variant="secondary">
            <Clock size={16} /> All time <ChevronDown size={14} />
          </Button>
        </PageHead>
        <div className="kpis">
          <Kpi title="Total inspections" value={kpis.total} note="All officers, all time" icon={BarChart2} />
          <Kpi title="Compliance rate" value={complianceRate != null ? `${complianceRate}%` : '—'} note="Share auto-approved" tone="green" icon={CheckCircle2} />
          <Kpi title="Review routing rate" value={reviewRate != null ? `${reviewRate}%` : '—'} note="Routed to human review" tone="amber" icon={ShieldAlert} />
          <Kpi title="Average OCR accuracy" value={kpis.avgConfidence != null ? `${kpis.avgConfidence}%` : '—'} note="Evidence extraction quality" tone="purple" icon={Gauge} />
        </div>
        <div className="grid2">
          <Card>
            <CardTitle title="Status trend" subtitle={trend.length ? 'Decisions by inspection date' : 'No inspection data yet'} />
            {trend.length > 1 ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={trend} margin={{ top: 4, left: 0, right: 8, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="d" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip />
                    <Line type="monotone" dataKey="compliant" stroke="#0E9F6E" strokeWidth={2} dot={false} name="Compliant" />
                    <Line type="monotone" dataKey="review" stroke="#C67A1F" strokeWidth={2} dot={false} name="Review" />
                    <Line type="monotone" dataKey="non" stroke="#DB4C4C" strokeWidth={2} dot={false} name="Non-compliant" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No status trend available" detail="Completed inspections will populate this chart." />
            )}
          </Card>
          <Card>
            <CardTitle title="Average confidence by capture method" subtitle={byCapture.length ? 'Evidence-quality signal, not accuracy' : 'No measurement data yet'} />
            {byCapture.length ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={byCapture} margin={{ top: 4, left: 0, right: 8, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7C4DFF" radius={[6, 6, 0, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No measurement data available" detail="Measurement results will populate this chart." />
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

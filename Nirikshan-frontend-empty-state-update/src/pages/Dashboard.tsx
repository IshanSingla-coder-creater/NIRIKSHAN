import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardPlus, Info, ClipboardList, CheckCircle2, ShieldAlert, AlertTriangle, FileQuestion, Gauge } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Shell } from '../components/Shell';
import { Card, CardTitle, PageHead, Kpi, Button, EmptyState } from '../components/ui';
import { ActionTable } from '../components/ActionTable';
import { useStore } from '../store';
import { actionQueue, categoryBreakdown, computeKpis, periodTrend, recurringObservations, statusDistribution, trendSeries } from '../selectors';

export function Dashboard() {
  const { state } = useStore();
  const inspections = state.inspections;
  const kpis = useMemo(() => computeKpis(inspections), [inspections]);
  const dist = useMemo(() => statusDistribution(inspections), [inspections]);
  const trend = useMemo(() => trendSeries(inspections), [inspections]);
  const categories = useMemo(() => categoryBreakdown(inspections), [inspections]);
  const recurring = useMemo(() => recurringObservations(inspections), [inspections]);
  const queue = useMemo(() => actionQueue(inspections).slice(0, 6), [inspections]);
  const totalTrend = useMemo(() => periodTrend(inspections, () => true), [inspections]);
  const compliantTrend = useMemo(() => periodTrend(inspections, (i) => i.status === 'COMPLIANT'), [inspections]);

  return (
    <Shell>
      <div className="page">
        <PageHead eyebrow="OPERATIONAL OVERVIEW" title="Dashboard">
          <Link to="/inspections/new">
            <Button>
              <ClipboardPlus size={17} /> Start inspection
            </Button>
          </Link>
        </PageHead>

        <div className="notice">
          <Info size={18} />
          <span>
            <b>Decision integrity:</b> AI assists extraction and interpretation. Deterministic regulatory rules evaluate compliance.
          </span>
          <Link to="/regulatory">
            Learn more <ArrowRight size={14} />
          </Link>
        </div>

        <div className="kpis">
          <Kpi title="Total inspections" value={kpis.total} note="Across all officers" icon={ClipboardList} trend={totalTrend ?? undefined} />
          <Kpi title="Compliant" value={kpis.compliant} note="Auto-approved" tone="green" icon={CheckCircle2} trend={compliantTrend ?? undefined} />
          <Kpi title="Non-compliant" value={kpis.nonCompliant} note="Notices required" tone="red" icon={ShieldAlert} />
          <Kpi title="Review required" value={kpis.review} note="Awaiting human decision" tone="amber" icon={AlertTriangle} />
          <Kpi title="Insufficient evidence" value={kpis.insufficient} note="Recapture requested" tone="gray" icon={FileQuestion} />
          <Kpi title="Average confidence" value={kpis.avgConfidence != null ? `${kpis.avgConfidence}%` : '—'} note="Evidence quality signal" tone="purple" icon={Gauge} />
        </div>

        <div className="sectionTitle">
          <div>
            <h2>Action queue</h2>
            <p>Priority cases that need a decision or intervention.</p>
          </div>
          <Link to="/reviews">
            View review queue <ArrowRight size={15} />
          </Link>
        </div>
        <ActionTable rows={queue} />

        <div className="grid2">
          <Card>
            <CardTitle title="Compliance status distribution" subtitle={dist.length ? `${kpis.total} inspections recorded` : 'No inspection data yet'} />
            {dist.length ? (
              <div className="chartRow">
                <div style={{ width: 150, height: 150 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={dist} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2}>
                        {dist.map((d) => (
                          <Cell key={d.name} fill={d.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="legend">
                  {dist.map((d) => (
                    <span key={d.name}>
                      <i className="dot" style={{ background: d.color }} />
                      {d.name}
                      <b>{d.value}</b>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No status distribution available" detail="Complete an inspection to begin tracking compliance outcomes." />
            )}
          </Card>

          <Card>
            <CardTitle title="Violation trend" subtitle={trend.length ? 'Compliant vs. review vs. non-compliant, by inspection date' : 'No inspection data yet'} />
            {trend.length > 1 ? (
              <div style={{ height: 190 }}>
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
              <EmptyState title="No trend data available" detail="Confirmed rule outcomes will appear here." />
            )}
          </Card>

          <Card>
            <CardTitle title="Violations by category" subtitle={categories.length ? 'Total confirmed violations' : 'No inspection data yet'} />
            {categories.length ? (
              <div style={{ height: 190 }}>
                <ResponsiveContainer>
                  <BarChart data={categories} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No category data available" detail="Category patterns will appear after inspections are recorded." />
            )}
          </Card>

          <Card>
            <CardTitle title="Recurring observations" subtitle={recurring.length ? 'Most frequent normalized violations' : 'No inspection data yet'} />
            {recurring.length ? (
              <div className="recurring">
                {recurring.map((r, i) => (
                  <div className="row" key={r.title}>
                    <b>{i + 1}</b>
                    <div className="body">
                      <strong>{r.title}</strong>
                      <small>{r.ruleId}</small>
                    </div>
                    <em>{r.count}×</em>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recurring observations" detail="The platform will identify repeat patterns as evidence is collected." />
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

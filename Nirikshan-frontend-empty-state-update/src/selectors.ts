import type { Inspection, Product } from './types';

export function computeKpis(inspections: Inspection[]) {
  const total = inspections.length;
  const compliant = inspections.filter((i) => i.status === 'COMPLIANT').length;
  const nonCompliant = inspections.filter((i) => i.status === 'NON-COMPLIANT').length;
  const review = inspections.filter((i) => i.status === 'REVIEW REQUIRED').length;
  const insufficient = inspections.filter((i) => i.status === 'INSUFFICIENT EVIDENCE').length;
  const confidences = inspections.filter((i) => i.confidence > 0).map((i) => i.confidence);
  const avgConfidence = confidences.length
    ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100)
    : null;
  return { total, compliant, nonCompliant, review, insufficient, avgConfidence };
}

export function statusDistribution(inspections: Inspection[]) {
  const map: Record<string, number> = {};
  inspections.forEach((i) => {
    map[i.status] = (map[i.status] || 0) + 1;
  });
  return [
    { name: 'Compliant', value: map['COMPLIANT'] || 0, color: '#0E9F6E' },
    { name: 'Non-compliant', value: map['NON-COMPLIANT'] || 0, color: '#DB4C4C' },
    { name: 'Review required', value: map['REVIEW REQUIRED'] || 0, color: '#C67A1F' },
    { name: 'Insufficient evidence', value: map['INSUFFICIENT EVIDENCE'] || 0, color: '#7A8CA6' },
  ].filter((d) => d.value > 0);
}

export function categoryBreakdown(inspections: Inspection[]) {
  const map = new Map<string, number>();
  inspections.forEach((i) => {
    if (i.violations > 0) map.set(i.category, (map.get(i.category) || 0) + i.violations);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

export function trendSeries(inspections: Inspection[]) {
  const map = new Map<string, { label: string; sortKey: number; compliant: number; review: number; non: number }>();
  inspections.forEach((i) => {
    const bucket = map.get(i.date) || { label: i.date.slice(0, 6), sortKey: new Date(i.date).getTime() || 0, compliant: 0, review: 0, non: 0 };
    if (i.status === 'COMPLIANT') bucket.compliant++;
    else if (i.status === 'REVIEW REQUIRED') bucket.review++;
    else if (i.status === 'NON-COMPLIANT') bucket.non++;
    map.set(i.date, bucket);
  });
  return [...map.values()].sort((a, b) => a.sortKey - b.sortKey).map(({ label, compliant, review, non }) => ({ d: label, compliant, review, non }));
}

export function recurringObservations(inspections: Inspection[]) {
  const map = new Map<string, { count: number; severity: string; ruleId: string }>();
  inspections.forEach((i) =>
    i.violationDetails.forEach((v) => {
      const cur = map.get(v.title);
      if (cur) cur.count++;
      else map.set(v.title, { count: 1, severity: v.severity, ruleId: v.ruleId });
    }),
  );
  return [...map.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function productDirectory(inspections: Inspection[]): Product[] {
  const map = new Map<string, Product>();
  inspections.forEach((i) => {
    const key = `${i.brand}::${i.product}`;
    const existing = map.get(key);
    if (existing) {
      existing.inspections++;
      existing.violations += i.violations;
      if (new Date(i.date).getTime() >= new Date(existing.lastDate).getTime()) {
        existing.lastDate = i.date;
        existing.lastStatus = i.status;
      }
    } else {
      map.set(key, {
        name: i.product,
        brand: i.brand,
        category: i.category,
        manufacturer: i.manufacturer,
        inspections: 1,
        violations: i.violations,
        lastStatus: i.status,
        lastDate: i.date,
      });
    }
  });
  return [...map.values()].sort((a, b) => b.violations - a.violations || b.inspections - a.inspections);
}

export function periodTrend(inspections: Inspection[], predicate: (i: Inspection) => boolean) {
  const dates = inspections.map((i) => new Date(i.date).getTime()).filter((d) => !Number.isNaN(d));
  if (!dates.length) return null;
  const anchor = Math.max(...dates);
  const week = 7 * 24 * 60 * 60 * 1000;
  const inWindow = (i: Inspection, from: number, to: number) => {
    const t = new Date(i.date).getTime();
    const age = anchor - t;
    return age >= from && age < to;
  };
  const recent = inspections.filter((i) => inWindow(i, 0, week) && predicate(i)).length;
  const prior = inspections.filter((i) => inWindow(i, week, week * 2) && predicate(i)).length;
  if (prior === 0 && recent === 0) return null;
  if (prior === 0) return { dir: 'up' as const, label: `+${recent} this week` };
  const pct = Math.round(((recent - prior) / prior) * 100);
  return { dir: (pct >= 0 ? 'up' : 'down') as 'up' | 'down', label: `${pct >= 0 ? '+' : ''}${pct}% vs last week` };
}

export function actionQueue(inspections: Inspection[]) {
  return inspections.filter((i) => i.status === 'REVIEW REQUIRED' || i.status === 'INSUFFICIENT EVIDENCE' || i.severity === 'CRITICAL');
}

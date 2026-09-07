import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardPlus } from 'lucide-react';
import { Card, Button, EmptyState } from './ui';
import { StatusBadge } from '../status';
import type { Inspection } from '../types';

export function ActionTable({
  rows,
  emptyTitle = 'No inspections need action',
  emptyDetail = 'Review-required cases, evidence requests, and high-severity findings will appear here.',
}: {
  rows: Inspection[];
  emptyTitle?: string;
  emptyDetail?: string;
}) {
  if (!rows.length)
    return (
      <Card className="tableCard">
        <EmptyState
          title={emptyTitle}
          detail={emptyDetail}
          action={
            <Link to="/inspections/new">
              <Button>
                <ClipboardPlus size={16} /> Start an inspection
              </Button>
            </Link>
          }
        />
      </Card>
    );
  return (
    <Card className="tableCard">
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Inspection</th>
              <th>Product &amp; category</th>
              <th>Officer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Required action</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id}>
                <td>
                  <Link to={`/inspections/${i.id}`} className="id">
                    {i.id}
                  </Link>
                </td>
                <td>
                  <b>{i.product}</b>
                  <small>{i.category}</small>
                </td>
                <td>{i.officer}</td>
                <td>{i.date}</td>
                <td>
                  <StatusBadge status={i.status} />
                </td>
                <td>{i.severity && <span className={`severity ${i.severity.toLowerCase()}`}>{i.severity}</span>}</td>
                <td>{i.action || '—'}</td>
                <td>
                  <Link to={`/inspections/${i.id}`}>
                    <Button variant="secondary">View</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

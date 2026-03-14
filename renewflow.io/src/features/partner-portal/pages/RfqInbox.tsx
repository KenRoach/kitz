"use client";

import { Link } from 'react-router-dom';
import { useRfqList } from '../hooks/useRfqs';

function urgencyColor(sentAt: string): string {
  const hoursAgo = (Date.now() - new Date(sentAt).getTime()) / (1000 * 60 * 60);
  if (hoursAgo > 72) return 'critical';
  if (hoursAgo > 24) return 'warning';
  return 'normal';
}

export function RfqInbox() {
  const { rfqs, loading, error, nextCursor, loadMore } = useRfqList();
  if (loading && rfqs.length === 0) return <div className="loading">Loading RFQs...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  const pending = rfqs.filter((r) => r.status === 'sent');
  const responded = rfqs.filter((r) => r.status !== 'sent');
  return (
    <div className="rfq-inbox">
      <h1>RFQ Inbox</h1>
      {pending.length > 0 && <section><h2>Pending ({pending.length})</h2>
        <div className="rfq-list">{pending.map((rfq) => (
          <Link key={rfq.id} to={`/partner/rfqs/${rfq.quoteId}`} className={`rfq-card rfq-card--${urgencyColor(rfq.sentAt)}`}>
            <div><span>{rfq.anonymizedRef}</span><span className={`urgency-dot urgency-dot--${urgencyColor(rfq.sentAt)}`} /></div>
            <div><span>{rfq.lineItemCount} items</span><span>Received {new Date(rfq.sentAt).toLocaleDateString()}</span></div>
          </Link>
        ))}</div></section>}
      {responded.length > 0 && <section><h2>History</h2>
        <table className="data-table"><thead><tr><th>Client</th><th>Status</th><th>Items</th><th>Date</th></tr></thead>
          <tbody>{responded.map((rfq) => (
            <tr key={rfq.id}><td><Link to={`/partner/rfqs/${rfq.quoteId}`}>{rfq.anonymizedRef}</Link></td>
              <td><span className={`status-badge status-badge--${rfq.status}`}>{rfq.status}</span></td>
              <td>{rfq.lineItemCount}</td><td>{new Date(rfq.sentAt).toLocaleDateString()}</td></tr>
          ))}</tbody></table></section>}
      {nextCursor && <button onClick={loadMore} className="btn btn-secondary" disabled={loading}>{loading ? 'Loading...' : 'Load More'}</button>}
    </div>
  );
}

"use client";

import { Link } from 'react-router-dom';
import { PartnerKpiCard } from '../components/PartnerKpiCard';
import { usePartnerDashboard } from '../hooks/usePartnerDashboard';

export function PartnerDashboard() {
  const { pendingRfqs, activePOs, monthlyRevenue, recentPOs, urgentRfqs, loading, error } = usePartnerDashboard();
  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  return (
    <div className="partner-dashboard">
      <h1>Partner Dashboard</h1>
      <div className="kpi-grid">
        <PartnerKpiCard title="Pending RFQs" value={pendingRfqs} variant={pendingRfqs > 0 ? 'warning' : 'default'} />
        <PartnerKpiCard title="Active POs" value={activePOs} />
        <PartnerKpiCard title="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} variant="success" />
      </div>
      {urgentRfqs.length > 0 && (
        <section><h2>Urgent RFQs</h2>
          <div className="rfq-alerts">{urgentRfqs.map((rfq) => (
            <Link key={rfq.id} to={`/partner/rfqs/${rfq.quoteId}`} className="rfq-alert-item">
              <span>{rfq.anonymizedRef}</span><span>{rfq.lineItemCount} items</span><span>{new Date(rfq.sentAt).toLocaleDateString()}</span>
            </Link>
          ))}</div>
        </section>
      )}
      <section><h2>Recent Purchase Orders</h2>
        <table className="data-table"><thead><tr><th>Client</th><th>Status</th><th>Items</th><th>Total</th><th>Date</th></tr></thead>
          <tbody>{recentPOs.map((po) => (
            <tr key={po.id}><td><Link to={`/partner/orders/${po.id}`}>{po.anonymizedRef}</Link></td>
              <td><span className={`status-badge status-badge--${po.status}`}>{po.status.replace(/_/g, ' ')}</span></td>
              <td>{po.lineItemCount}</td><td>${po.total.toLocaleString()}</td><td>{new Date(po.createdAt).toLocaleDateString()}</td></tr>
          ))}</tbody></table>
      </section>
    </div>
  );
}

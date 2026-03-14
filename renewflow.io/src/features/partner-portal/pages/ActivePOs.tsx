"use client";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePartnerOrders } from '../hooks/usePartnerOrders';

const STATUS_FILTERS = [{ value: '', label: 'All' }, { value: 'routed', label: 'Routed' }, { value: 'acknowledged', label: 'Acknowledged' }, { value: 'entitlement_verified', label: 'Verified' }, { value: 'completed', label: 'Completed' }];

export function ActivePOs() {
  const [statusFilter, setStatusFilter] = useState('');
  const { orders, loading, error } = usePartnerOrders(statusFilter || undefined);
  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  return (
    <div className="active-pos"><h1>Active Purchase Orders</h1>
      <div className="filter-bar">{STATUS_FILTERS.map((f) => (
        <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}>{f.label}</button>
      ))}</div>
      <table className="data-table"><thead><tr><th>Client</th><th>Status</th><th>Items</th><th>Total</th><th>Date</th></tr></thead>
        <tbody>{orders.map((po) => (
          <tr key={po.id}><td><Link to={`/partner/orders/${po.id}`}>{po.anonymizedRef}</Link></td>
            <td><span className={`status-badge status-badge--${po.status}`}>{po.status.replace(/_/g, ' ')}</span></td>
            <td>{po.lineItemCount}</td><td>${po.total.toLocaleString()}</td><td>{new Date(po.createdAt).toLocaleDateString()}</td></tr>
        ))}</tbody></table>
      {orders.length === 0 && <p className="empty-state">No purchase orders found.</p>}
    </div>
  );
}

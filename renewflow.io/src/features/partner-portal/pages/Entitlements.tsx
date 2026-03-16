"use client";

import { Link } from 'react-router-dom';
import { usePartnerOrders } from '../hooks/usePartnerOrders';

export function Entitlements() {
  const { orders, loading, error } = usePartnerOrders('acknowledged');
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  return (
    <div className="entitlements-page"><h1>Entitlements</h1><p>Enter entitlement details for acknowledged purchase orders.</p>
      {orders.length === 0 ? <p className="empty-state">No orders awaiting entitlement entry.</p> : (
        <table className="data-table"><thead><tr><th>Client</th><th>Items</th><th>Total</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>{orders.map((po) => (
            <tr key={po.id}><td>{po.anonymizedRef}</td><td>{po.lineItemCount}</td><td>${po.total.toLocaleString()}</td>
              <td>{new Date(po.createdAt).toLocaleDateString()}</td>
              <td><Link to={`/partner/entitlements/${po.id}`} className="btn btn-sm btn-primary">Enter Entitlements</Link></td></tr>
          ))}</tbody></table>
      )}
    </div>
  );
}

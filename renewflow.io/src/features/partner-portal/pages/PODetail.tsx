"use client";

import { useParams, Link } from 'react-router-dom';
import { usePartnerOrderDetail } from '../hooks/usePartnerOrders';
import { StatusStepper } from '../components/StatusStepper';

export function PODetail() {
  const { id } = useParams<{ id: string }>();
  const { order, loading, error, acknowledge } = usePartnerOrderDetail(id!);
  if (loading) return <div className="loading">Loading order...</div>;
  if (error || !order) return <div className="error">{error || 'Order not found'}</div>;
  const lineItems = order.order_line_item ?? [];
  return (
    <div className="po-detail"><h1>Purchase Order</h1>
      <StatusStepper currentStatus={order.status} />
      <div className="po-info"><p><strong>Total:</strong> ${parseFloat(order.total).toLocaleString()}</p><p><strong>Created:</strong> {new Date(order.created_at).toLocaleDateString()}</p></div>
      <h2>Line Items</h2>
      <table className="data-table"><thead><tr><th>Coverage</th><th>Duration</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
        <tbody>{lineItems.map((li: any) => (
          <tr key={li.id}><td>{li.coverage_type.toUpperCase()}</td><td>{li.duration_months}mo</td><td>{li.quantity}</td>
            <td>${parseFloat(li.unit_price).toLocaleString()}</td><td>${(parseFloat(li.unit_price) * li.quantity).toLocaleString()}</td></tr>
        ))}</tbody></table>
      <div className="po-actions">
        {order.status === 'routed' && <button onClick={acknowledge} className="btn btn-primary">Acknowledge Receipt</button>}
        {order.status === 'acknowledged' && <Link to={`/partner/entitlements/${order.id}`} className="btn btn-primary">Enter Entitlements</Link>}
      </div>
    </div>
  );
}

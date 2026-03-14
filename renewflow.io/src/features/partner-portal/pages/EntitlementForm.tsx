"use client";

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePartnerOrderDetail } from '../hooks/usePartnerOrders';
import { useEntitlementSubmit, type EntitlementEntry } from '../hooks/useEntitlements';

export function EntitlementForm() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, loading: orderLoading } = usePartnerOrderDetail(orderId!);
  const { submit, submitting, error, success } = useEntitlementSubmit(orderId!);
  const [entries, setEntries] = useState<Record<string, EntitlementEntry>>({});
  if (orderLoading) return <div className="loading">Loading order...</div>;
  if (!order) return <div className="error">Order not found</div>;
  if (success) return (
    <div className="entitlement-success"><h1>Entitlements Submitted</h1><p>Submitted for operator verification.</p>
      <button onClick={() => navigate('/partner/entitlements')} className="btn btn-primary">Back to Entitlements</button>
    </div>
  );
  const lineItems = order.order_line_item ?? [];
  const updateEntry = (assetId: string, field: keyof EntitlementEntry, value: string) => setEntries((p) => ({ ...p, [assetId]: { assetId, entitlementId: '', coverageStart: '', coverageEnd: '', ...p[assetId], [field]: value } }));
  const handleSubmit = async () => { const ents = Object.values(entries).filter((e) => e.entitlementId && e.coverageStart && e.coverageEnd); if (ents.length > 0) await submit(ents); };
  return (
    <div className="entitlement-form"><h1>Enter Entitlements</h1><p>Enter entitlement ID and coverage dates for each line item.</p>
      {error && <div className="error">{error}</div>}
      <table className="data-table"><thead><tr><th>Coverage</th><th>Duration</th><th>Entitlement ID</th><th>Coverage Start</th><th>Coverage End</th></tr></thead>
        <tbody>{lineItems.map((li: any) => (
          <tr key={li.id}><td>{li.coverage_type.toUpperCase()}</td><td>{li.duration_months}mo</td>
            <td><input type="text" placeholder="ENT-XXXX" value={entries[li.asset_id]?.entitlementId ?? ''} onChange={(e) => updateEntry(li.asset_id, 'entitlementId', e.target.value)} /></td>
            <td><input type="date" value={entries[li.asset_id]?.coverageStart ?? ''} onChange={(e) => updateEntry(li.asset_id, 'coverageStart', e.target.value)} /></td>
            <td><input type="date" value={entries[li.asset_id]?.coverageEnd ?? ''} onChange={(e) => updateEntry(li.asset_id, 'coverageEnd', e.target.value)} /></td>
          </tr>
        ))}</tbody></table>
      <div className="form-actions">
        <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit Entitlements'}</button>
        <button onClick={() => navigate('/partner/entitlements')} className="btn btn-secondary">Cancel</button>
      </div>
    </div>
  );
}

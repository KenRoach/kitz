"use client";

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRfqDetail } from '../hooks/useRfqs';

export function RfqDetail() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { quote, loading, error, respond } = useRfqDetail(quoteId!);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (loading) return <div className="loading">Loading RFQ...</div>;
  if (error || !quote) return <div className="error">{error || 'RFQ not found'}</div>;
  const lineItems = quote.quote_line_item ?? [];
  const canRespond = quote.status === 'rfq_pending';
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await respond(Object.entries(prices).filter(([, p]) => p !== '').map(([id, p]) => ({ lineItemId: id, unitPrice: parseFloat(p) })), notes || undefined);
      navigate('/partner/rfqs');
    } catch { setSubmitting(false); }
  };
  return (
    <div className="rfq-detail">
      <h1>RFQ Detail</h1>
      <p>Status: <span className={`status-badge status-badge--${quote.status}`}>{quote.status}</span></p>
      <table className="data-table"><thead><tr><th>Brand</th><th>Model</th><th>Serial</th><th>Coverage</th><th>Duration</th><th>Qty</th>{canRespond && <th>Your Price</th>}</tr></thead>
        <tbody>{lineItems.map((li: any) => (
          <tr key={li.id}><td>{li.asset_item?.brand ?? '—'}</td><td>{li.asset_item?.model ?? '—'}</td><td>{li.asset_item?.serial ?? '—'}</td>
            <td>{li.coverage_type.toUpperCase()}</td><td>{li.duration_months}mo</td><td>{li.quantity}</td>
            {canRespond && <td><input type="number" step="0.01" min="0" placeholder="0.00" value={prices[li.id] ?? ''} onChange={(e) => setPrices((p) => ({ ...p, [li.id]: e.target.value }))} className="price-input" /></td>}
          </tr>
        ))}</tbody></table>
      {canRespond && <div className="rfq-response-form">
        <label>Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes..." /></label>
        <div className="form-actions">
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit Pricing'}</button>
          <button onClick={() => navigate('/partner/rfqs')} className="btn btn-secondary">Cancel</button>
        </div>
      </div>}
    </div>
  );
}

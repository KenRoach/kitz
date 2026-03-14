"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { priceListApi } from '../services/partner.api';

export function PriceListForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ brand: '', model_pattern: '', coverage_type: 'tpm' as 'tpm' | 'oem', duration_months: 12, unit_price: 0, valid_from: new Date().toISOString().split('T')[0], valid_until: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (isEdit) priceListApi.list().then((r) => { const e = r.data.find((x) => x.id === id); if (e) setForm({ brand: e.brand, model_pattern: e.model_pattern, coverage_type: e.coverage_type, duration_months: e.duration_months, unit_price: e.unit_price, valid_from: e.valid_from ?? '', valid_until: e.valid_until ?? '' }); }); }, [id, isEdit]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError(null);
    try { const payload = { ...form, valid_from: form.valid_from ?? '', valid_until: form.valid_until ?? '' }; if (isEdit) await priceListApi.update(id!, payload); else await priceListApi.create(payload); navigate('/partner/price-lists'); }
    catch (err) { setError((err as Error).message); setSubmitting(false); }
  };
  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));
  return (
    <div className="price-list-form"><h1>{isEdit ? 'Edit' : 'Add'} Price List Entry</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>Brand<input type="text" value={form.brand} onChange={(e) => update('brand', e.target.value)} required /></label>
          <label>Model Pattern<input type="text" value={form.model_pattern} onChange={(e) => update('model_pattern', e.target.value)} required placeholder="e.g. PowerEdge R7*" /><small>Use * as wildcard</small></label>
          <label>Coverage Type<select value={form.coverage_type} onChange={(e) => update('coverage_type', e.target.value)}><option value="tpm">TPM</option><option value="oem">OEM</option></select></label>
          <label>Duration (months)<input type="number" min="1" value={form.duration_months} onChange={(e) => update('duration_months', parseInt(e.target.value))} required /></label>
          <label>Unit Price ($)<input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => update('unit_price', parseFloat(e.target.value))} required /></label>
          <label>Valid From<input type="date" value={form.valid_from} onChange={(e) => update('valid_from', e.target.value)} required /></label>
          <label>Valid Until<input type="date" value={form.valid_until} onChange={(e) => update('valid_until', e.target.value)} required /></label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</button>
          <button type="button" onClick={() => navigate('/partner/price-lists')} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

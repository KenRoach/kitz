"use client";

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePriceLists } from '../hooks/usePriceLists';

export function PriceLists() {
  const { entries, loading, error, remove } = usePriceLists();
  const [filter, setFilter] = useState('');
  if (loading) return <div className="loading">Loading price lists...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  const filtered = entries.filter((e) => !filter || e.brand.toLowerCase().includes(filter.toLowerCase()) || e.model_pattern.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="price-lists">
      <div className="page-header"><h1>Price Lists</h1><Link to="/partner/price-lists/new" className="btn btn-primary">Add Entry</Link></div>
      <input type="text" placeholder="Filter by brand or model..." value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-input" />
      <table className="data-table"><thead><tr><th>Brand</th><th>Model Pattern</th><th>Coverage</th><th>Duration</th><th>Price</th><th>Valid From</th><th>Valid Until</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((entry) => (
          <tr key={entry.id} className={new Date(entry.valid_until) < new Date() ? 'row--expired' : ''}>
            <td>{entry.brand}</td><td><code>{entry.model_pattern}</code></td><td>{entry.coverage_type.toUpperCase()}</td>
            <td>{entry.duration_months}mo</td><td>${entry.unit_price.toLocaleString()}</td><td>{entry.valid_from}</td><td>{entry.valid_until}</td>
            <td><Link to={`/partner/price-lists/${entry.id}/edit`} className="btn btn-sm">Edit</Link> <button onClick={() => remove(entry.id)} className="btn btn-sm btn-danger">Delete</button></td>
          </tr>
        ))}</tbody></table>
      {filtered.length === 0 && <p className="empty-state">No price list entries found.</p>}
    </div>
  );
}

import { apiFetch } from '@/services/api-client';

export interface PartnerRfq { id: string; quoteId: string; status: string; sentAt: string; lineItemCount: number; anonymizedRef: string; }
export interface PartnerPO { id: string; status: string; total: number; anonymizedRef: string; createdAt: string; lineItemCount: number; }
export interface PriceListEntry { id: string; brand: string; model_pattern: string; coverage_type: 'tpm' | 'oem'; duration_months: number; unit_price: number; valid_from: string; valid_until: string; }

export const rfqApi = {
  list: (cursor?: string) => apiFetch<{ data: PartnerRfq[]; nextCursor: string | null; hasMore: boolean }>(`/quotes?${cursor ? `cursor=${cursor}&` : ''}limit=50`),
  getDetail: (quoteId: string) => apiFetch<any>(`/quotes/${quoteId}`),
  respond: (quoteId: string, body: { lineItems: { lineItemId: string; unitPrice: number }[]; notes?: string }) =>
    apiFetch<any>(`/quotes/${quoteId}/rfq/respond`, { method: 'POST', body: JSON.stringify(body) }),
};

export const priceListApi = {
  list: (cursor?: string) => apiFetch<{ data: PriceListEntry[]; nextCursor: string | null; hasMore: boolean }>(`/price-lists?${cursor ? `cursor=${cursor}&` : ''}limit=50`),
  create: (entry: Omit<PriceListEntry, 'id'>) => apiFetch<PriceListEntry>('/price-lists', { method: 'POST', body: JSON.stringify({
    brand: entry.brand, modelPattern: entry.model_pattern, coverageType: entry.coverage_type,
    durationMonths: entry.duration_months, unitPrice: entry.unit_price, validFrom: entry.valid_from, validUntil: entry.valid_until,
  })}),
  update: (id: string, entry: Partial<PriceListEntry>) => apiFetch<PriceListEntry>(`/price-lists/${id}`, { method: 'PATCH', body: JSON.stringify(entry) }),
  remove: (id: string) => apiFetch<null>(`/price-lists/${id}`, { method: 'DELETE' }),
};

export const orderApi = {
  list: (cursor?: string, status?: string) => apiFetch<{ data: PartnerPO[]; nextCursor: string | null; hasMore: boolean }>(`/orders?${cursor ? `cursor=${cursor}&` : ''}${status ? `status=${status}&` : ''}limit=50`),
  getDetail: (id: string) => apiFetch<any>(`/orders/${id}`),
  acknowledge: (id: string) => apiFetch<any>(`/orders/${id}/acknowledge`, { method: 'POST' }),
};

export const entitlementApi = {
  submit: (orderId: string, entitlements: { assetId: string; entitlementId: string; coverageStart: string; coverageEnd: string }[]) =>
    apiFetch<any>(`/orders/${orderId}/verify-entitlement`, { method: 'POST', body: JSON.stringify({ entitlements }) }),
};

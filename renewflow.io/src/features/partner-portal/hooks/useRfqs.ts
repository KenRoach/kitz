import { useState, useEffect, useCallback } from 'react';
import { rfqApi } from '../services/partner.api';
import type { PartnerRfq } from '../services/partner.api';

export function useRfqList() {
  const [rfqs, setRfqs] = useState<PartnerRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const fetchRfqs = useCallback(async (cursor?: string) => {
    try { setLoading(true); const result = await rfqApi.list(cursor); setRfqs((prev) => cursor ? [...prev, ...result.data] : result.data); setNextCursor(result.nextCursor); }
    catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchRfqs(); }, [fetchRfqs]);
  return { rfqs, loading, error, nextCursor, loadMore: () => nextCursor && fetchRfqs(nextCursor), refresh: () => fetchRfqs() };
}

export function useRfqDetail(quoteId: string) {
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { rfqApi.getDetail(quoteId).then(setQuote).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, [quoteId]);
  const respond = async (lineItems: { lineItemId: string; unitPrice: number }[], notes?: string) => {
    await rfqApi.respond(quoteId, { lineItems, notes }); setQuote(await rfqApi.getDetail(quoteId));
  };
  return { quote, loading, error, respond };
}

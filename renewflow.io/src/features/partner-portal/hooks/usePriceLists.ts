import { useState, useEffect, useCallback } from 'react';
import { priceListApi } from '../services/partner.api';
import type { PriceListEntry } from '../services/partner.api';

export function usePriceLists() {
  const [entries, setEntries] = useState<PriceListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setLoading(true); setEntries((await priceListApi.list()).data); } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return {
    entries, loading, error, refresh,
    create: async (entry: Omit<PriceListEntry, 'id'>) => { await priceListApi.create(entry); await refresh(); },
    update: async (id: string, entry: Partial<PriceListEntry>) => { await priceListApi.update(id, entry); await refresh(); },
    remove: async (id: string) => { await priceListApi.remove(id); await refresh(); },
  };
}

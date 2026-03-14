import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../services/partner.api';
import type { PartnerPO } from '../services/partner.api';

export function usePartnerOrders(statusFilter?: string) {
  const [orders, setOrders] = useState<PartnerPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try { setLoading(true); setOrders((await orderApi.list(undefined, statusFilter)).data); } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }, [statusFilter]);
  useEffect(() => { refresh(); }, [refresh]);
  return { orders, loading, error, refresh };
}

export function usePartnerOrderDetail(orderId: string) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { try { setOrder(await orderApi.getDetail(orderId)); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } }, [orderId]);
  useEffect(() => { refresh(); }, [refresh]);
  return { order, loading, error, acknowledge: async () => { await orderApi.acknowledge(orderId); await refresh(); }, refresh };
}

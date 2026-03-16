import { useState, useEffect } from 'react';
import { orderApi, rfqApi } from '../services/partner.api';
import type { PartnerPO, PartnerRfq } from '../services/partner.api';

export function usePartnerDashboard() {
  const [data, setData] = useState({ pendingRfqs: 0, activePOs: 0, monthlyRevenue: 0, recentPOs: [] as PartnerPO[], urgentRfqs: [] as PartnerRfq[], loading: true, error: null as string | null });
  useEffect(() => {
    Promise.all([rfqApi.list(), orderApi.list()]).then(([rfqs, orders]) => {
      setData({
        pendingRfqs: rfqs.data.filter((r) => r.status === 'sent').length,
        activePOs: orders.data.filter((o) => !['completed', 'cancelled'].includes(o.status)).length,
        monthlyRevenue: orders.data.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0),
        recentPOs: orders.data.slice(0, 5), urgentRfqs: rfqs.data.filter((r) => r.status === 'sent').slice(0, 5),
        loading: false, error: null,
      });
    }).catch((err) => setData((p) => ({ ...p, loading: false, error: (err as Error).message })));
  }, []);
  return data;
}

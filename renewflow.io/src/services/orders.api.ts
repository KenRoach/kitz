import { apiFetch } from "./api-client";

export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  created_at: string;
  updated_at: string;
  line_item_count: number;
  partner_name?: string;
}

interface OrderListResponse {
  data: OrderSummary[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const ordersApi = {
  list: (params?: { cursor?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.status) qs.set("status", params.status);
    qs.set("limit", "50");
    return apiFetch<OrderListResponse>(`/orders?${qs}`);
  },

  getById: (id: string) => apiFetch<any>(`/orders/${id}`),

  create: (data: { quoteId: string; partnerId: string }) =>
    apiFetch<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
};

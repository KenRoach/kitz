import { apiFetch } from "./api-client";
import type { SupportTicket } from "@/types";

interface TicketListResponse {
  data: SupportTicket[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const supportApi = {
  list: (params?: { cursor?: string; status?: string; priority?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.status) qs.set("status", params.status);
    if (params?.priority) qs.set("priority", params.priority);
    qs.set("limit", "50");
    return apiFetch<TicketListResponse>(`/support?${qs}`);
  },

  getById: (id: string) => apiFetch<SupportTicket>(`/support/${id}`),

  create: (data: { subject: string; description: string; priority: string; assetId?: string; poId?: string }) =>
    apiFetch<SupportTicket>("/support", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<SupportTicket>) =>
    apiFetch<SupportTicket>(`/support/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  escalate: (id: string) =>
    apiFetch<SupportTicket>(`/support/${id}/escalate`, { method: "POST" }),
};

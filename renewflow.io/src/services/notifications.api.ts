import { apiFetch } from "./api-client";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface NotificationListResponse {
  data: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const notificationsApi = {
  list: (cursor?: string) => {
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    qs.set("limit", "50");
    return apiFetch<NotificationListResponse>(`/notifications?${qs}`);
  },

  markRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    apiFetch<{ success: boolean }>("/notifications/mark-all-read", { method: "POST" }),
};

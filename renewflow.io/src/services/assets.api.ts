import { apiFetch } from "./api-client";
import type { Asset } from "@/types";

interface AssetListResponse {
  data: Asset[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const assetsApi = {
  list: (params?: { cursor?: string; brand?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set("cursor", params.cursor);
    if (params?.brand) qs.set("brand", params.brand);
    if (params?.status) qs.set("status", params.status);
    if (params?.search) qs.set("search", params.search);
    qs.set("limit", "100");
    return apiFetch<AssetListResponse>(`/assets?${qs}`);
  },

  getById: (id: string) => apiFetch<Asset>(`/assets/${id}`),

  update: (id: string, data: Partial<Asset>) =>
    apiFetch<Asset>(`/assets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  remove: (id: string) => apiFetch<null>(`/assets/${id}`, { method: "DELETE" }),
};

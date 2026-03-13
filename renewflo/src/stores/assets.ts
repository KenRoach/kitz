import { create } from "zustand";
import type { Asset } from "@/types";
import { INITIAL_ASSETS } from "@/data/seeds";
import { listAssets as fetchAssets, addAssets as pushAssets } from "@/services/gateway";

interface AssetStore {
  assets: Asset[];
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addAssets: (newAssets: Asset[]) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: INITIAL_ASSETS,
  loading: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    try {
      const assets = await fetchAssets();
      set({ assets, hydrated: true, loading: false });
    } catch {
      // Fallback to seed data if gateway is unavailable
      set({ hydrated: true, loading: false });
    }
  },

  addAssets: (newAssets) => {
    set((state) => ({
      assets: [...state.assets, ...newAssets],
    }));
    // Fire-and-forget push to gateway
    pushAssets(newAssets).catch(() => {});
  },

  updateAsset: (id, patch) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
}));

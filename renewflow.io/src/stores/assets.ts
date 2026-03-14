import { create } from "zustand";
import type { Asset } from "@/types";
import { listAssets } from "@/services/api";
import { INITIAL_ASSETS } from "@/data/seeds";

const ASSETS_STORAGE_KEY = "renewflow_assets";

function persistAssets(assets: Asset[]) {
  try { localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets)); } catch { /* quota */ }
}

function loadPersistedAssets(): Asset[] | null {
  try {
    const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Asset[];
    return parsed.length > 0 ? parsed : null;
  } catch { return null; }
}

interface AssetStore {
  assets: Asset[];
  loading: boolean;
  loaded: boolean;
  addAssets: (newAssets: Asset[]) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  loadFromApi: () => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  loading: false,
  loaded: false,

  loadFromApi: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await listAssets();
      const apiAssets = (data.assets || []) as Asset[];
      if (apiAssets.length > 0) {
        persistAssets(apiAssets);
        set({ assets: apiAssets, loaded: true, loading: false });
        return;
      }
    } catch { /* gateway unavailable */ }

    // Fallback: localStorage > seed data
    const cached = loadPersistedAssets();
    const assets = cached || INITIAL_ASSETS;
    persistAssets(assets);
    set({ assets, loaded: true, loading: false });
  },

  addAssets: (newAssets) =>
    set((state) => {
      const assets = [...state.assets, ...newAssets];
      persistAssets(assets);
      return { assets };
    }),

  updateAsset: (id, patch) =>
    set((state) => {
      const assets = state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a));
      persistAssets(assets);
      return { assets };
    }),

  removeAsset: (id) =>
    set((state) => {
      const assets = state.assets.filter((a) => a.id !== id);
      persistAssets(assets);
      return { assets };
    }),
}));

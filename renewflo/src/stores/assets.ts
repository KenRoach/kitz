import { create } from "zustand";
import type { Asset } from "@/types";
import { INITIAL_ASSETS } from "@/data/seeds";

interface AssetStore {
  assets: Asset[];
  addAssets: (newAssets: Asset[]) => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: INITIAL_ASSETS,

  addAssets: (newAssets) =>
    set((state) => ({
      assets: [...state.assets, ...newAssets],
    })),

  updateAsset: (id, patch) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),
}));

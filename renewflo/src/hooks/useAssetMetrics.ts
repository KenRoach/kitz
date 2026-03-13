import { useMemo } from "react";
import type { Asset } from "@/types";

export interface AssetMetrics {
  totalDevices: number;
  uniqueClients: number;
  totalOEM: number;
  totalTPM: number;
  savings: number;
  alertCount: number;
  lapsedCount: number;
  quotedCount: number;
}

export function useAssetMetrics(assets: Asset[]): AssetMetrics {
  return useMemo(() => {
    const totalOEM = assets.reduce((s, a) => s + (a.oem ?? 0), 0);
    const totalTPM = assets.reduce((s, a) => s + a.tpm, 0);

    return {
      totalDevices: assets.length,
      uniqueClients: new Set(assets.map((a) => a.client)).size,
      totalOEM,
      totalTPM,
      savings: totalOEM - totalTPM,
      alertCount: assets.filter((a) => a.daysLeft <= 30 && a.daysLeft >= 0).length,
      lapsedCount: assets.filter((a) => a.daysLeft < 0).length,
      quotedCount: assets.filter((a) => a.status === "quoted").length,
    };
  }, [assets]);
}

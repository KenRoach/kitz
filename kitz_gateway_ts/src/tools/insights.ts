/** Insights tool — deep portfolio analysis. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

// NOTE: asset_item columns: id, org_id, import_batch_id, brand, model, serial, device_type, tier, warranty_end, purchase_date, status, created_at, updated_at
// client, days_left, oem, tpm don't exist in asset_item — insights using those fields are commented out
interface Asset {
  brand: string;
  org_id: string;
  tier: string;
  warranty_end: string | null;
  status: string;
}

function bucket(daysLeft: number): string {
  if (daysLeft < 0) return "lapsed";
  if (daysLeft <= 7) return "critical_7d";
  if (daysLeft <= 14) return "urgent_14d";
  if (daysLeft <= 30) return "warning_30d";
  if (daysLeft <= 60) return "attention_60d";
  return "healthy_90d";
}

export const insightTools: ToolDef[] = [
  {
    name: "generate_insights",
    description: "Deep portfolio analysis — concentration, heatmap, savings, tier distribution",
    handler: async () => {
      const db = getSupabase();
      const { data, error } = await db.from("asset_item").select("*");
      if (error) throw new Error(error.message);

      const assets = (data ?? []) as Asset[];
      const total = assets.length;

      // Org concentration (replaces client concentration — client column doesn't exist in asset_item)
      const orgCounts = new Map<string, number>();
      for (const a of assets) orgCounts.set(a.org_id, (orgCounts.get(a.org_id) ?? 0) + 1);
      const orgConcentration = Array.from(orgCounts.entries())
        .map(([org_id, count]) => ({ org_id, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

      // Expiry heatmap — computed from warranty_end instead of days_left
      const now = Date.now();
      const expiryHeatmap: Record<string, number> = {};
      for (const a of assets) {
        if (!a.warranty_end) continue;
        const daysLeft = Math.floor((new Date(a.warranty_end).getTime() - now) / 86400000);
        const b = bucket(daysLeft);
        expiryHeatmap[b] = (expiryHeatmap[b] ?? 0) + 1;
      }

      // Brand distribution (oem/tpm pricing not available in asset_item)
      const brandCounts = new Map<string, number>();
      for (const a of assets) brandCounts.set(a.brand, (brandCounts.get(a.brand) ?? 0) + 1);
      const brandDistribution = Array.from(brandCounts.entries())
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count);

      // Tier distribution
      const tierCounts = new Map<string, number>();
      for (const a of assets) tierCounts.set(a.tier, (tierCounts.get(a.tier) ?? 0) + 1);
      const tierDistribution = Array.from(tierCounts.entries())
        .map(([tier, count]) => ({ tier, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

      return {
        orgConcentration,
        expiryHeatmap,
        brandDistribution,
        // TODO: revenueAtRisk and brandSavings require oem/tpm pricing columns
        tierDistribution,
        totalDevices: total,
      };
    },
  },
];

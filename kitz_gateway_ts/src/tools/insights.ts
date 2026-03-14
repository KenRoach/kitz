/** Insights tool — deep portfolio analysis. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

interface Asset {
  brand: string;
  client: string;
  tier: string;
  days_left: number;
  oem: number | null;
  tpm: number | null;
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
      const { data, error } = await db.from("assets").select("*");
      if (error) throw new Error(error.message);

      const assets = (data ?? []) as Asset[];
      const total = assets.length;

      // Client concentration
      const clientCounts = new Map<string, number>();
      for (const a of assets) clientCounts.set(a.client, (clientCounts.get(a.client) ?? 0) + 1);
      const clientConcentration = Array.from(clientCounts.entries())
        .map(([client, count]) => ({ client, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

      // Expiry heatmap
      const expiryHeatmap: Record<string, number> = {};
      for (const a of assets) {
        const b = bucket(a.days_left);
        expiryHeatmap[b] = (expiryHeatmap[b] ?? 0) + 1;
      }

      // Brand savings
      const brandMap = new Map<string, { oem: number; tpm: number; count: number }>();
      for (const a of assets) {
        const entry = brandMap.get(a.brand) ?? { oem: 0, tpm: 0, count: 0 };
        entry.oem += Number(a.oem) || 0;
        entry.tpm += Number(a.tpm) || 0;
        entry.count++;
        brandMap.set(a.brand, entry);
      }
      const brandSavings = Array.from(brandMap.entries()).map(([brand, v]) => ({
        brand,
        oem: Math.round(v.oem * 100) / 100,
        tpm: Math.round(v.tpm * 100) / 100,
        savings: Math.round((v.oem - v.tpm) * 100) / 100,
        savingsPct: v.oem > 0 ? Math.round(((v.oem - v.tpm) / v.oem) * 100) : 0,
        count: v.count,
      }));

      // Revenue at risk (devices expiring within 30 days)
      const atRisk = assets.filter((a) => a.days_left >= 0 && a.days_left <= 30);
      const revenueAtRisk = atRisk.reduce((s, a) => s + (Number(a.tpm) || 0), 0);

      // Tier distribution
      const tierCounts = new Map<string, number>();
      for (const a of assets) tierCounts.set(a.tier, (tierCounts.get(a.tier) ?? 0) + 1);
      const tierDistribution = Array.from(tierCounts.entries())
        .map(([tier, count]) => ({ tier, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

      return {
        clientConcentration,
        expiryHeatmap,
        brandSavings,
        revenueAtRisk: Math.round(revenueAtRisk * 100) / 100,
        atRiskDevices: atRisk.length,
        tierDistribution,
        totalDevices: total,
      };
    },
  },
];

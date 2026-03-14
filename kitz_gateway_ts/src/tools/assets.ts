/** Asset management tools — list, add, metrics. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    days_left: "daysLeft",
    warranty_end: "warrantyEnd",
    device_type: "deviceType",
    purchase_date: "purchaseDate",
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

export const assetTools: ToolDef[] = [
  {
    name: "list_assets",
    description: "Query assets with optional filters (client, tier, status, brand, max_days)",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("assets").select("*");

      if (args.client) query = query.eq("client", args.client as string);
      if (args.tier) query = query.eq("tier", args.tier as string);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.brand) query = query.eq("brand", args.brand as string);
      if (args.max_days != null) query = query.lte("days_left", args.max_days as number);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const assets = (data ?? []).map(toCamel);
      return { assets, count: assets.length };
    },
  },
  {
    name: "add_assets",
    description: "Bulk insert/update assets",
    handler: async (args) => {
      const db = getSupabase();
      const assets = args.assets as Record<string, unknown>[];
      if (!Array.isArray(assets)) throw new Error("assets must be an array");

      const rows = assets.map((a) => ({
        id: a.id,
        brand: a.brand,
        model: a.model,
        serial: a.serial,
        client: a.client,
        tier: a.tier,
        days_left: a.daysLeft ?? a.days_left,
        oem: a.oem,
        tpm: a.tpm,
        status: a.status,
        warranty_end: a.warrantyEnd ?? a.warranty_end,
        device_type: a.deviceType ?? a.device_type,
        purchase_date: a.purchaseDate ?? a.purchase_date,
        quantity: a.quantity ?? 1,
      }));

      const { error } = await db.from("assets").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(error.message);

      return { inserted: rows.length };
    },
  },
  {
    name: "get_asset_metrics",
    description: "Calculate portfolio KPIs",
    handler: async () => {
      const db = getSupabase();
      const { data, error } = await db.from("assets").select("*");
      if (error) throw new Error(error.message);

      const assets = data ?? [];
      const clients = new Set(assets.map((a) => a.client));
      const totalOEM = assets.reduce((s, a) => s + (Number(a.oem) || 0), 0);
      const totalTPM = assets.reduce((s, a) => s + (Number(a.tpm) || 0), 0);

      return {
        totalDevices: assets.length,
        uniqueClients: clients.size,
        totalOEM: Math.round(totalOEM * 100) / 100,
        totalTPM: Math.round(totalTPM * 100) / 100,
        savings: Math.round((totalOEM - totalTPM) * 100) / 100,
        alertCount: assets.filter((a) => a.days_left >= 0 && a.days_left <= 30).length,
        lapsedCount: assets.filter((a) => a.days_left < 0).length,
        quotedCount: assets.filter((a) => a.status === "quoted").length,
      };
    },
  },
];

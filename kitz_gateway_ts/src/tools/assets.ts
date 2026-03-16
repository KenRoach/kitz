/** Asset management tools — list, add, metrics. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    warranty_end: "warrantyEnd",
    device_type: "deviceType",
    purchase_date: "purchaseDate",
    org_id: "orgId",
    import_batch_id: "importBatchId",
    created_at: "createdAt",
    updated_at: "updatedAt",
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
      let query = db.from("asset_item").select("*");

      // NOTE: asset_item columns: id, org_id, import_batch_id, brand, model, serial, device_type, tier, warranty_end, purchase_date, status, created_at, updated_at
      // Removed: client, days_left filters (columns don't exist in asset_item)
      if (args.tier) query = query.eq("tier", args.tier as string);
      if (args.status) query = query.eq("status", args.status as string);
      if (args.brand) query = query.eq("brand", args.brand as string);
      if (args.org_id) query = query.eq("org_id", args.org_id as string);
      if (args.device_type) query = query.eq("device_type", args.device_type as string);

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

      // asset_item columns: id, org_id, import_batch_id, brand, model, serial, device_type, tier, warranty_end, purchase_date, status, created_at, updated_at
      const rows = assets.map((a) => ({
        id: a.id,
        org_id: a.orgId ?? a.org_id,
        import_batch_id: a.importBatchId ?? a.import_batch_id,
        brand: a.brand,
        model: a.model,
        serial: a.serial,
        tier: a.tier,
        status: a.status,
        warranty_end: a.warrantyEnd ?? a.warranty_end,
        device_type: a.deviceType ?? a.device_type,
        purchase_date: a.purchaseDate ?? a.purchase_date,
      }));

      const { error } = await db.from("asset_item").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(error.message);

      return { inserted: rows.length };
    },
  },
  {
    name: "get_asset_metrics",
    description: "Calculate portfolio KPIs",
    handler: async () => {
      const db = getSupabase();
      const { data, error } = await db.from("asset_item").select("*");
      if (error) throw new Error(error.message);

      const assets = data ?? [];
      const orgs = new Set(assets.map((a) => a.org_id));
      // NOTE: oem, tpm, client, days_left columns don't exist in asset_item
      // Metrics based on available columns only
      return {
        totalDevices: assets.length,
        uniqueOrgs: orgs.size,
        quotedCount: assets.filter((a) => a.status === "quoted").length,
        // TODO: add oem/tpm/days_left metrics once pricing columns are available
      };
    },
  },
];

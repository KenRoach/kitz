/** Asset management tools — list, add, metrics. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

/** Strip angle brackets to prevent stored XSS in user-supplied strings. */
function sanitize(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.replace(/[<>]/g, "").trim();
}

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
      const rows = assets.map((a) => {
        const row: Record<string, unknown> = {
          org_id: a.orgId ?? a.org_id ?? args.org_id,
          import_batch_id: a.importBatchId ?? a.import_batch_id,
          brand: sanitize(a.brand),
          model: sanitize(a.model),
          serial: sanitize(a.serial),
          device_type: sanitize(a.deviceType ?? a.device_type),
          tier: a.tier,
          status: a.status,
          warranty_end: a.warrantyEnd ?? a.warranty_end,
          purchase_date: a.purchaseDate ?? a.purchase_date,
        };
        if (a.id) row.id = a.id; // only include id if provided (let DB generate otherwise)
        return row;
      });

      // Deduplicate by serial+org_id: query existing serials for the org, skip duplicates
      const orgId = rows[0]?.org_id as string | undefined;
      const serials = rows.map((r) => r.serial as string).filter(Boolean);
      let existingSerials = new Set<string>();
      if (orgId && serials.length > 0) {
        const { data: existing } = await db
          .from("asset_item")
          .select("serial")
          .eq("org_id", orgId)
          .in("serial", serials);
        existingSerials = new Set((existing ?? []).map((e) => e.serial as string));
      }

      const newRows = rows.filter((r) => !existingSerials.has(r.serial as string));
      const skipped = rows.length - newRows.length;

      if (newRows.length > 0) {
        const { error } = await db.from("asset_item").insert(newRows);
        if (error) throw new Error(error.message);
      }

      return { inserted: newRows.length, skipped };
    },
  },
  {
    name: "get_asset_metrics",
    description: "Calculate portfolio KPIs",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("asset_item").select("*");
      if (args.org_id) query = query.eq("org_id", args.org_id as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const assets = data ?? [];
      return {
        totalDevices: assets.length,
        uniqueOrgs: new Set(assets.map((a) => a.org_id)).size,
        quotedCount: assets.filter((a) => a.status === "quoted").length,
      };
    },
  },
];

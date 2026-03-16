/** Order management tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    quote_ref: "quoteRef",
    vendor_po: "vendorPO",
    delivery_partner: "deliveryPartner",
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

export const orderTools: ToolDef[] = [
  {
    name: "list_orders",
    description: "Query purchase orders with optional status filter",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("order_po").select("*");
      if (args.status) query = query.eq("status", args.status as string);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const orders = (data ?? []).map(toCamel);
      return { orders, count: orders.length };
    },
  },
  {
    name: "create_order",
    description: "Create a new purchase order",
    handler: async (args) => {
      const db = getSupabase();
      const now = new Date().toISOString().slice(0, 10);
      const row = {
        id: args.id as string,
        client: args.client as string,
        quote_ref: (args.quoteRef ?? args.quote_ref ?? null) as string | null,
        status: (args.status as string) ?? "draft",
        total: Number(args.total) || 0,
        created: (args.created as string) ?? now,
        updated: now,
        vendor_po: (args.vendorPO ?? args.vendor_po ?? null) as string | null,
        delivery_partner: (args.deliveryPartner ?? args.delivery_partner ?? null) as string | null,
        notes: (args.notes ?? null) as string | null,
        items: args.items ?? [],
      };

      // NOTE: order_po column names may differ — verify schema matches these fields
      const { data, error } = await db.from("order_po").insert(row).select().single();
      if (error) throw new Error(error.message);

      return { order: toCamel(data) };
    },
  },
];

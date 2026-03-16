/** Business inventory tools. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";

export const inventoryTools: ToolDef[] = [
  {
    name: "biz_track_inventory",
    description: "Actualizar inventario — agregar o restar cantidad de un producto",
    parameters: {
      type: "object",
      properties: {
        item_name: { type: "string", description: "Nombre del producto" },
        quantity: { type: "number", description: "Cantidad a agregar (positivo) o restar (negativo)" },
        unit: { type: "string", description: "Unidad de medida (default: unidad)" },
        unit_cost: { type: "number", description: "Costo por unidad (opcional)" },
      },
      required: ["item_name", "quantity"],
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const itemName = args.item_name as string;
      const delta = args.quantity as number;
      const unit = (args.unit as string) || "unidad";
      const unitCost = (args.unit_cost as number) || undefined;

      if (!profileId) throw new Error("profile_id is required");
      if (!itemName) throw new Error("item_name is required");
      if (delta === undefined) throw new Error("quantity is required");

      // Check if item exists
      const { data: existing } = await db
        .from("kz_inventory")
        .select("*")
        .eq("profile_id", profileId)
        .eq("item_name", itemName)
        .single();

      if (existing) {
        const newQty = Number(existing.quantity) + delta;
        const updates: Record<string, unknown> = {
          quantity: newQty,
          updated_at: new Date().toISOString(),
        };
        if (unitCost !== undefined) updates.unit_cost = unitCost;

        const { data, error } = await db
          .from("kz_inventory")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        return { item: data, message: `${itemName}: ${newQty} ${unit}` };
      }

      // Create new item
      const { data, error } = await db
        .from("kz_inventory")
        .insert({
          profile_id: profileId,
          item_name: itemName,
          quantity: delta,
          unit,
          unit_cost: unitCost ?? 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { item: data, message: `Nuevo producto: ${itemName} — ${delta} ${unit}` };
    },
  },
  {
    name: "biz_list_inventory",
    description: "Listar inventario actual del negocio",
    parameters: { type: "object", properties: {} },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;

      if (!profileId) throw new Error("profile_id is required");

      const { data, error } = await db
        .from("kz_inventory")
        .select("*")
        .eq("profile_id", profileId)
        .order("item_name");

      if (error) throw new Error(error.message);

      const lowStock = (data ?? []).filter((i) => Number(i.quantity) <= 5);

      return {
        items: data ?? [],
        count: data?.length ?? 0,
        lowStock: lowStock.map((i) => i.item_name),
        message: lowStock.length > 0
          ? `⚠ Stock bajo: ${lowStock.map((i) => `${i.item_name} (${i.quantity})`).join(", ")}`
          : `${data?.length ?? 0} productos en inventario`,
      };
    },
  },
];

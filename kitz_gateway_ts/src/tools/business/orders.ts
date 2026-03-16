/** Business order tools. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";

export const orderTools: ToolDef[] = [
  {
    name: "biz_capture_order",
    description: "Registrar una venta o pedido del negocio",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string", description: "Descripción de la venta" },
        amount: { type: "number", description: "Monto total de la venta" },
        customer_name: { type: "string", description: "Nombre del cliente (opcional)" },
        items: { type: "array", description: "Lista de items vendidos (opcional)" },
        status: { type: "string", description: "Estado: completed, pending, cancelled" },
      },
      required: ["description", "amount"],
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const description = args.description as string;
      const amount = args.amount as number;
      const customerName = (args.customer_name as string) || null;
      const items = (args.items as unknown[]) || [];
      const status = (args.status as string) || "completed";

      if (!profileId) throw new Error("profile_id is required");
      if (!description) throw new Error("description is required");

      const { data, error } = await db
        .from("kz_orders")
        .insert({
          profile_id: profileId,
          description,
          amount: amount || 0,
          customer_name: customerName,
          items,
          status,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { order: data, message: `Venta registrada: ${description} — $${amount ?? 0}` };
    },
  },
  {
    name: "biz_list_orders",
    description: "Listar ventas/pedidos recientes del negocio",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Cantidad máxima de resultados" },
      },
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const limit = (args.limit as number) || 20;

      if (!profileId) throw new Error("profile_id is required");

      const { data, error } = await db
        .from("kz_orders")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return { orders: data ?? [], count: data?.length ?? 0 };
    },
  },
  {
    name: "biz_daily_summary",
    description: "Resumen de ventas del día",
    parameters: { type: "object", properties: {} },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;

      if (!profileId) throw new Error("profile_id is required");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await db
        .from("kz_orders")
        .select("*")
        .eq("profile_id", profileId)
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      const orders = data ?? [];
      const total = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

      return {
        date: today.toISOString().split("T")[0],
        orderCount: orders.length,
        totalSales: total,
        orders,
        message: `Hoy: ${orders.length} ventas por $${total.toFixed(2)}`,
      };
    },
  },
];

/** Business insights tools — LLM-generated summaries. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";
import { getLlmRouter } from "../../llm/router.js";

export const insightTools: ToolDef[] = [
  {
    name: "biz_business_insights",
    description: "Generar análisis e insights del negocio usando IA",
    parameters: { type: "object", properties: {} },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;

      if (!profileId) throw new Error("profile_id is required");

      // Gather recent data
      const [orders, expenses, inventory] = await Promise.all([
        db.from("kz_orders").select("*").eq("profile_id", profileId)
          .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
          .order("created_at", { ascending: false }),
        db.from("kz_expenses").select("*").eq("profile_id", profileId)
          .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
        db.from("kz_inventory").select("*").eq("profile_id", profileId),
      ]);

      const profile = await db.from("kz_business_profiles").select("*")
        .eq("id", profileId).single();

      const context = {
        businessType: profile.data?.business_type ?? "negocio",
        businessName: profile.data?.business_name ?? "Mi Negocio",
        weekOrders: orders.data ?? [],
        weekExpenses: expenses.data ?? [],
        inventory: inventory.data ?? [],
      };

      const totalSales = context.weekOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
      const totalExpenses = context.weekExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
      const lowStock = context.inventory.filter((i) => Number(i.quantity) <= 5);

      const router = getLlmRouter();
      const response = await router.route({
        messages: [
          {
            role: "system",
            content: `Eres Kitz, asistente de negocios. Genera insights breves y accionables en español para un(a) ${context.businessType} llamado "${context.businessName}". Máximo 200 palabras.`,
          },
          {
            role: "user",
            content: `Datos de la semana:
- Ventas: ${context.weekOrders.length} pedidos, total $${totalSales.toFixed(2)}
- Gastos: ${context.weekExpenses.length} registros, total $${totalExpenses.toFixed(2)}
- Ganancia bruta: $${(totalSales - totalExpenses).toFixed(2)}
- Inventario bajo: ${lowStock.map((i) => `${i.item_name} (${i.quantity})`).join(", ") || "ninguno"}

Dame 3 insights accionables para mejorar el negocio esta semana.`,
          },
        ],
      }, "generation");

      return { insights: response.text, data: { totalSales, totalExpenses, lowStock: lowStock.length } };
    },
  },
  {
    name: "biz_weekly_report",
    description: "Generar reporte semanal del negocio",
    parameters: { type: "object", properties: {} },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;

      if (!profileId) throw new Error("profile_id is required");

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [orders, expenses] = await Promise.all([
        db.from("kz_orders").select("*").eq("profile_id", profileId)
          .gte("created_at", weekAgo),
        db.from("kz_expenses").select("*").eq("profile_id", profileId)
          .gte("created_at", weekAgo),
      ]);

      const orderList = orders.data ?? [];
      const expenseList = expenses.data ?? [];
      const totalSales = orderList.reduce((s, o) => s + Number(o.amount || 0), 0);
      const totalExpenses = expenseList.reduce((s, e) => s + Number(e.amount || 0), 0);

      // Group orders by day
      const byDay: Record<string, number> = {};
      for (const o of orderList) {
        const day = new Date(o.created_at).toISOString().split("T")[0]!;
        byDay[day] = (byDay[day] || 0) + Number(o.amount || 0);
      }

      return {
        period: "7 días",
        totalSales,
        totalExpenses,
        profit: totalSales - totalExpenses,
        orderCount: orderList.length,
        expenseCount: expenseList.length,
        salesByDay: byDay,
        message: `Semana: $${totalSales.toFixed(2)} ventas, $${totalExpenses.toFixed(2)} gastos, $${(totalSales - totalExpenses).toFixed(2)} ganancia`,
      };
    },
  },
];

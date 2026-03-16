/** Business expense tools. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";

export const expenseTools: ToolDef[] = [
  {
    name: "biz_track_expense",
    description: "Registrar un gasto del negocio",
    parameters: {
      type: "object",
      properties: {
        description: { type: "string", description: "Descripción del gasto" },
        amount: { type: "number", description: "Monto del gasto" },
        category: { type: "string", description: "Categoría: ingredientes, servicios, renta, transporte, general" },
      },
      required: ["description", "amount"],
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const description = args.description as string;
      const amount = args.amount as number;
      const category = (args.category as string) || "general";

      if (!profileId) throw new Error("profile_id is required");
      if (!description) throw new Error("description is required");
      if (amount === undefined || amount === null) throw new Error("amount is required");

      const { data, error } = await db
        .from("kz_expenses")
        .insert({ profile_id: profileId, description, amount, category })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { expense: data, message: `Gasto registrado: ${description} — $${amount}` };
    },
  },
  {
    name: "biz_list_expenses",
    description: "Listar gastos recientes del negocio",
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
        .from("kz_expenses")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return { expenses: data ?? [], count: data?.length ?? 0 };
    },
  },
  {
    name: "biz_expense_summary",
    description: "Resumen de gastos por categoría",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Días hacia atrás para el resumen (default: 30)" },
      },
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const daysBack = (args.days as number) || 30;

      if (!profileId) throw new Error("profile_id is required");

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);

      const { data, error } = await db
        .from("kz_expenses")
        .select("*")
        .eq("profile_id", profileId)
        .gte("created_at", cutoff.toISOString());

      if (error) throw new Error(error.message);

      const expenses = data ?? [];
      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const e of expenses) {
        const cat = e.category || "general";
        byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount);
        total += Number(e.amount);
      }

      return {
        period: `${daysBack} días`,
        total,
        byCategory,
        count: expenses.length,
        message: `Gastos (${daysBack}d): $${total.toFixed(2)} en ${expenses.length} registros`,
      };
    },
  },
];

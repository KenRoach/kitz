/** Business customer/CRM tools. */

import type { ToolDef } from "../registry.js";
import { getSupabase } from "../../db/client.js";

export const customerTools: ToolDef[] = [
  {
    name: "biz_add_customer",
    description: "Agregar un cliente al directorio del negocio",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre del cliente" },
        phone: { type: "string", description: "Teléfono del cliente (opcional)" },
        email: { type: "string", description: "Email del cliente (opcional)" },
        notes: { type: "string", description: "Notas sobre el cliente (opcional)" },
      },
      required: ["name"],
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const name = args.name as string;
      const phone = (args.phone as string) || null;
      const email = (args.email as string) || null;
      const notes = (args.notes as string) || null;

      if (!profileId) throw new Error("profile_id is required");
      if (!name) throw new Error("name is required");

      const { data, error } = await db
        .from("kz_customers")
        .insert({ profile_id: profileId, name, phone, email, notes })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { customer: data, message: `Cliente agregado: ${name}` };
    },
  },
  {
    name: "biz_list_customers",
    description: "Listar clientes del negocio",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Cantidad máxima de resultados" },
      },
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const limit = (args.limit as number) || 50;

      if (!profileId) throw new Error("profile_id is required");

      const { data, error } = await db
        .from("kz_customers")
        .select("*")
        .eq("profile_id", profileId)
        .order("last_interaction", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return { customers: data ?? [], count: data?.length ?? 0 };
    },
  },
  {
    name: "biz_customer_followup",
    description: "Sugerir clientes que necesitan seguimiento",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Días sin contacto para considerar seguimiento (default: 14)" },
      },
    },
    handler: async (args) => {
      const db = getSupabase();
      const profileId = args.profile_id as string;
      const daysSinceContact = (args.days as number) || 14;

      if (!profileId) throw new Error("profile_id is required");

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysSinceContact);

      const { data, error } = await db
        .from("kz_customers")
        .select("*")
        .eq("profile_id", profileId)
        .lt("last_interaction", cutoff.toISOString())
        .order("last_interaction", { ascending: true });

      if (error) throw new Error(error.message);

      return {
        customers: data ?? [],
        count: data?.length ?? 0,
        message: `${data?.length ?? 0} clientes sin contacto en ${daysSinceContact}+ días`,
      };
    },
  },
];

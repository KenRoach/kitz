/** Support ticket tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

export const ticketTools: ToolDef[] = [
  {
    name: "list_tickets",
    description: "Query support tickets with optional status filter",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("support_ticket").select("*");
      if (args.status) query = query.eq("status", args.status as string);

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return { tickets: data ?? [], count: (data ?? []).length };
    },
  },
];

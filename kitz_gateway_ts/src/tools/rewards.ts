/** Rewards tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

export const rewardTools: ToolDef[] = [
  {
    name: "get_rewards",
    description: "Returns rewards profile and history",
    handler: async () => {
      const db = getSupabase();
      const { data, error } = await db.from("rewards").select("*").eq("id", 1).single();
      if (error) throw new Error(error.message);

      return {
        points: data.points,
        level: data.level,
        nextLevel: data.next_level,
        nextAt: data.next_at,
        history: data.history,
      };
    },
  },
];

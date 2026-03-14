/** Inbox tools. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

export const inboxTools: ToolDef[] = [
  {
    name: "list_inbox",
    description: "Query inbox messages",
    handler: async () => {
      const db = getSupabase();
      const { data, error } = await db.from("inbox").select("*").order("id", { ascending: true });
      if (error) throw new Error(error.message);

      const messages = (data ?? []).map((m) => ({
        id: m.id,
        from: m.sender,
        company: m.company,
        subject: m.subject,
        preview: m.preview,
        time: m.time,
        unread: m.unread,
      }));
      return { messages, count: messages.length };
    },
  },
];

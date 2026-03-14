/** Email tools — send_email, send_warranty_alerts, check_alerts. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";
import { sendEmail as mailerSend, buildAlertForAsset, isConfigured } from "../services/mailer.js";

export const emailTools: ToolDef[] = [
  {
    name: "send_email",
    description: "Send an email via SMTP",
    handler: async (args) => {
      if (!isConfigured()) throw new Error("SMTP not configured");
      const to = args.to as string;
      const subject = args.subject as string;
      const body = args.body as string;
      if (!to || !subject || !body) throw new Error("to, subject, and body are required");
      return mailerSend(to, subject, body, args.html_body as string | undefined);
    },
  },
  {
    name: "send_warranty_alerts",
    description: "Send warranty alert emails for expiring assets",
    handler: async (args) => {
      if (!isConfigured()) throw new Error("SMTP not configured");

      const db = getSupabase();
      const maxDays = (args.max_days as number) ?? 30;
      const { data, error } = await db
        .from("assets")
        .select("*")
        .gte("days_left", 0)
        .lte("days_left", maxDays);

      if (error) throw new Error(error.message);

      const results: { sent: boolean; to: string; subject: string; error?: string }[] = [];
      for (const asset of data ?? []) {
        const { subject, body, html } = buildAlertForAsset(asset);
        const to = (args.to as string) ?? "renewals@renewflow.io";
        try {
          const result = await mailerSend(to, subject, body, html);
          results.push(result);
        } catch (err) {
          results.push({ sent: false, to, subject, error: (err as Error).message });
        }
      }

      const succeeded = results.filter((r) => r.sent).length;
      return { sent: succeeded, total: results.length, results };
    },
  },
  {
    name: "check_alerts",
    description: "Dry-run alert check — lists assets that would trigger alerts",
    handler: async (args) => {
      const db = getSupabase();
      const maxDays = (args.max_days as number) ?? 30;
      const { data, error } = await db
        .from("assets")
        .select("id, brand, model, serial, client, days_left, status")
        .gte("days_left", 0)
        .lte("days_left", maxDays)
        .order("days_left", { ascending: true });

      if (error) throw new Error(error.message);

      return { alerts: data ?? [], count: (data ?? []).length };
    },
  },
];

/** Email tools — send_email, send_warranty_alerts, check_alerts. */

import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";
import { sendEmail as mailerSend, isConfigured } from "../services/mailer.js";

/* ── Asset row matching actual asset_item table schema ── */
interface AssetRow {
  id: string;
  org_id: string;
  import_batch_id: string | null;
  brand: string;
  model: string;
  serial: string;
  device_type: string | null;
  tier: string | null;
  warranty_end: string | null;
  purchase_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Helpers ── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00Z").getTime();
  const now = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  return Math.ceil((target - now) / 86_400_000);
}

/* ── Build alert email from an asset row ── */

function buildAlertForAsset(asset: AssetRow): { subject: string; body: string; html: string } {
  const { brand, model, serial, device_type, tier, warranty_end, status } = asset;
  const days_left = warranty_end ? daysUntil(warranty_end) : 0;

  const subject = `\u26A0 Warranty Expiring: ${brand} ${model} (${days_left}d remaining)`;

  const tierLabel = tier ?? "standard";
  let recommendation: string;
  if (tierLabel === "critical") {
    recommendation = "Immediate renewal recommended for critical-tier device.";
  } else if (days_left <= 7) {
    recommendation = "Warranty expires within 7 days — urgent action required.";
  } else {
    recommendation = "Review renewal options before warranty lapses.";
  }

  const urgencyColor = days_left <= 7 ? "#dc2626" : days_left <= 30 ? "#f59e0b" : "#3b82f6";

  const body = [
    `Warranty Alert: ${brand} ${model}`,
    `Serial: ${serial}`,
    device_type ? `Device type: ${device_type}` : null,
    `Tier: ${tierLabel}`,
    `Status: ${status ?? "unknown"}`,
    warranty_end ? `Warranty end: ${warranty_end}` : null,
    `Days remaining: ${days_left}`,
    `Recommendation: ${recommendation}`,
  ].filter(Boolean).join("\n");

  const eBrand = escapeHtml(brand);
  const eModel = escapeHtml(model);
  const eSerial = escapeHtml(serial);
  const eTier = escapeHtml(tierLabel);
  const eDeviceType = escapeHtml(device_type ?? "—");
  const eStatus = escapeHtml(status ?? "unknown");

  const html = `
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${urgencyColor};color:#fff;padding:12px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">\u26A0 Warranty Expiring &mdash; ${days_left} days</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;">Device</td><td style="padding:6px 0;font-weight:600;">${eBrand} ${eModel}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Serial</td><td style="padding:6px 0;">${eSerial}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Type</td><td style="padding:6px 0;">${eDeviceType}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Tier</td><td style="padding:6px 0;">${eTier}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Status</td><td style="padding:6px 0;">${eStatus}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Warranty End</td><td style="padding:6px 0;">${warranty_end ?? "—"}</td></tr>
        </table>
        <div style="margin-top:16px;padding:12px;background:#f3f4f6;border-radius:6px;">
          <strong>Recommendation:</strong> ${escapeHtml(recommendation)}
        </div>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent by RenewFlow</p>
    </div>`;

  return { subject, body, html };
}

/* ── Tool definitions ── */

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
      const cutoffDate = new Date(Date.now() + maxDays * 86_400_000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await db
        .from("asset_item")
        .select("id, org_id, import_batch_id, brand, model, serial, device_type, tier, warranty_end, purchase_date, status, created_at, updated_at")
        .gte("warranty_end", today)
        .lte("warranty_end", cutoffDate);

      if (error) throw new Error(error.message);

      const results: { sent: boolean; to: string; subject: string; error?: string }[] = [];
      for (const asset of (data ?? []) as AssetRow[]) {
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
      const cutoffDate = new Date(Date.now() + maxDays * 86_400_000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await db
        .from("asset_item")
        .select("id, brand, model, serial, device_type, tier, warranty_end, status, org_id")
        .gte("warranty_end", today)
        .lte("warranty_end", cutoffDate)
        .order("warranty_end", { ascending: true });

      if (error) throw new Error(error.message);

      const alerts = ((data ?? []) as AssetRow[]).map((a) => ({
        id: a.id,
        brand: a.brand,
        model: a.model,
        serial: a.serial,
        device_type: a.device_type,
        tier: a.tier,
        warranty_end: a.warranty_end,
        days_left: a.warranty_end ? daysUntil(a.warranty_end) : null,
        status: a.status,
        org_id: a.org_id,
      }));

      return { alerts, count: alerts.length };
    },
  },
];

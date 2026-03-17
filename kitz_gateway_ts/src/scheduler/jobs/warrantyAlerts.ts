/** RenewFlow warranty alert scheduler job.
 *
 * Runs daily, checks asset_item for upcoming expirations at
 * 90/60/30/14/7/0 day thresholds, creates notif_alert records,
 * and sends email notifications via SMTP.
 */

import { getSupabase } from "../../db/client.js";
import { sendEmail, isConfigured } from "../../services/mailer.js";

const THRESHOLDS = [90, 60, 30, 14, 7, 0] as const;

interface AssetHit {
  id: string;
  org_id: string;
  brand: string;
  model: string;
  serial: string;
  device_type: string | null;
  tier: string | null;
  warranty_end: string;
}

function priorityForThreshold(days: number): string {
  if (days <= 0) return "high";
  if (days <= 7) return "critical";
  if (days <= 14) return "high";
  if (days <= 30) return "high";
  return "medium";
}

function buildAlertEmail(asset: AssetHit, daysLeft: number): { subject: string; body: string; html: string } {
  const { brand, model, serial, tier } = asset;
  const urgencyColor = daysLeft <= 7 ? "#dc2626" : daysLeft <= 30 ? "#f59e0b" : "#3b82f6";
  const label = daysLeft <= 0 ? "EXPIRED" : `${daysLeft}d remaining`;

  const subject = `⚠ Warranty ${daysLeft <= 0 ? "Expired" : "Expiring"}: ${brand} ${model} (${label})`;
  const body = `${brand} ${model} (${serial}) — warranty ${daysLeft <= 0 ? "has expired" : `expires in ${daysLeft} days`}. Tier: ${tier ?? "standard"}.`;

  const html = `
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${urgencyColor};color:#fff;padding:12px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">⚠ Warranty ${daysLeft <= 0 ? "Expired" : "Expiring"} — ${label}</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;">Device</td><td style="padding:6px 0;font-weight:600;">${brand} ${model}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Serial</td><td style="padding:6px 0;">${serial}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Tier</td><td style="padding:6px 0;">${tier ?? "standard"}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Warranty End</td><td style="padding:6px 0;">${asset.warranty_end}</td></tr>
        </table>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent by RenewFlow</p>
    </div>`;

  return { subject, body, html };
}

/** Run the warranty alert check. Called by the scheduler once per day. */
export async function runWarrantyAlerts(): Promise<{ created: number; sent: number; errors: number }> {
  const db = getSupabase();
  let created = 0;
  let sent = 0;
  let errors = 0;

  for (const threshold of THRESHOLDS) {
    const targetDate = new Date(Date.now() + threshold * 86_400_000).toISOString().slice(0, 10);

    // Find assets whose warranty_end matches this threshold date
    const { data: assets, error } = await db
      .from("asset_item")
      .select("id, org_id, brand, model, serial, device_type, tier, warranty_end")
      .eq("warranty_end", targetDate);

    if (error) {
      console.error(`[warranty-alerts] Query error for ${threshold}d threshold:`, error.message);
      errors++;
      continue;
    }

    if (!assets || assets.length === 0) continue;

    for (const asset of assets as AssetHit[]) {
      // Check if alert already exists for this asset+threshold
      const { data: existing } = await db
        .from("notif_alert")
        .select("id")
        .eq("asset_id", asset.id)
        .eq("threshold_days", threshold)
        .limit(1);

      if (existing && existing.length > 0) continue; // Already alerted

      // Create alert record
      const priority = priorityForThreshold(threshold);
      const { data: alert, error: insertErr } = await db
        .from("notif_alert")
        .insert({ org_id: asset.org_id, asset_id: asset.id, threshold_days: threshold, priority, status: "pending" })
        .select("id")
        .single();

      if (insertErr) {
        console.error(`[warranty-alerts] Insert error:`, insertErr.message);
        errors++;
        continue;
      }

      created++;

      // Send email if SMTP configured
      if (isConfigured()) {
        const { subject, body, html } = buildAlertEmail(asset, threshold);
        const recipient = "renewals@renewflow.io"; // TODO: look up org contact

        try {
          await sendEmail(recipient, subject, body, html);

          // Log email
          await db.from("notif_email_log").insert({
            alert_id: alert.id,
            recipient,
            subject,
            status: "sent",
          });

          // Mark alert as sent
          await db.from("notif_alert").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", alert.id);
          sent++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          await db.from("notif_email_log").insert({
            alert_id: alert.id,
            recipient,
            subject,
            status: "failed",
            error: msg,
          });
          await db.from("notif_alert").update({ status: "failed" }).eq("id", alert.id);
          errors++;
        }
      }
    }
  }

  console.log(`[warranty-alerts] Done: ${created} created, ${sent} sent, ${errors} errors`);
  return { created, sent, errors };
}

/** Nodemailer SMTP service — warranty alert templates. */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _transport: Transporter | null = null;
let _from = "alerts@renewflow.io";

export function configure(host: string, port: number, user: string, pass: string, from: string): void {
  _from = from;
  _transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
}

export function isConfigured(): boolean {
  return _transport !== null;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<{ sent: boolean; to: string; subject: string }> {
  if (!_transport) throw new Error("SMTP not configured");

  await _transport.sendMail({
    from: _from,
    to,
    subject,
    text: body,
    html: html ?? undefined,
  });

  return { sent: true, to, subject };
}

interface AssetRow {
  brand: string;
  model: string;
  serial: string;
  client: string;
  days_left: number;
  tier: string;
  oem: number | null;
  tpm: number | null;
}

export function buildAlertForAsset(asset: AssetRow): { subject: string; body: string; html: string } {
  const { brand, model, serial, client, days_left, tier, oem, tpm } = asset;

  const subject = `⚠ Warranty Expiring: ${brand} ${model} (${days_left}d remaining)`;

  let recommendation: string;
  if (tier === "critical") {
    recommendation = "OEM coverage recommended for critical-tier device.";
  } else if (oem && tpm && ((oem - tpm) / oem) > 0.3) {
    recommendation = `TPM recommended — save ${Math.round(((oem - tpm) / oem) * 100)}% vs OEM.`;
  } else {
    recommendation = "Review both OEM and TPM options.";
  }

  const urgencyColor = days_left <= 7 ? "#dc2626" : days_left <= 30 ? "#f59e0b" : "#3b82f6";

  const body = [
    `Warranty Alert: ${brand} ${model}`,
    `Serial: ${serial}`,
    `Client: ${client}`,
    `Days remaining: ${days_left}`,
    `Tier: ${tier}`,
    oem ? `OEM price: $${oem}` : null,
    tpm ? `TPM price: $${tpm}` : null,
    `Recommendation: ${recommendation}`,
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${urgencyColor};color:#fff;padding:12px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">⚠ Warranty Expiring — ${days_left} days</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;">Device</td><td style="padding:6px 0;font-weight:600;">${brand} ${model}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Serial</td><td style="padding:6px 0;">${serial}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Client</td><td style="padding:6px 0;">${client}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Tier</td><td style="padding:6px 0;">${tier}</td></tr>
          ${oem ? `<tr><td style="padding:6px 0;color:#6b7280;">OEM Price</td><td style="padding:6px 0;">$${oem}</td></tr>` : ""}
          ${tpm ? `<tr><td style="padding:6px 0;color:#6b7280;">TPM Price</td><td style="padding:6px 0;">$${tpm}</td></tr>` : ""}
        </table>
        <div style="margin-top:16px;padding:12px;background:#f3f4f6;border-radius:6px;">
          <strong>Recommendation:</strong> ${recommendation}
        </div>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent by RenewFlow</p>
    </div>`;

  return { subject, body, html };
}

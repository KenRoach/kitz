/** Email service — Resend API (primary) with Nodemailer SMTP fallback. */

import { Resend } from "resend";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _resend: Resend | null = null;
let _transport: Transporter | null = null;
let _from = "onboarding@resend.dev";

export function configure(host: string, port: number, user: string, pass: string, from: string): void {
  _from = from;

  // If using Resend SMTP credentials, use the Resend HTTP API instead (faster + more reliable)
  if (host === "smtp.resend.com" && pass.startsWith("re_")) {
    _resend = new Resend(pass);
    return;
  }

  // Fall back to Nodemailer SMTP for other providers
  if (host) {
    _transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
  }
}

/** Configure directly with a Resend API key. */
export function configureResend(apiKey: string, from?: string): void {
  _resend = new Resend(apiKey);
  if (from) _from = from;
}

export function isConfigured(): boolean {
  return _resend !== null || _transport !== null;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<{ sent: boolean; to: string; subject: string }> {
  // 1. Resend HTTP API (preferred)
  if (_resend) {
    const { error } = await _resend.emails.send({
      from: _from,
      to,
      subject,
      text: body,
      html: html ?? undefined,
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return { sent: true, to, subject };
  }

  // 2. Nodemailer SMTP fallback
  if (_transport) {
    await _transport.sendMail({
      from: _from,
      to,
      subject,
      text: body,
      html: html ?? undefined,
    });
    return { sent: true, to, subject };
  }

  // 3. Dev fallback: log email to console so reset links are visible
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  📧  EMAIL (not configured — console fallback)             ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  To:      ${to}`);
  console.log(`║  Subject: ${subject}`);
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(body);
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  return { sent: true, to, subject };
}

export function buildPasswordResetEmail(resetUrl: string): { subject: string; body: string; html: string } {
  const subject = "Reset your RenewFlow password";

  const body = [
    "Reset your RenewFlow password",
    "",
    "You requested a password reset for your RenewFlow account.",
    "",
    `Click the link below to set a new password:`,
    resetUrl,
    "",
    "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
    "",
    "— The RenewFlow Team",
    "https://renewflow.io",
  ].join("\n");

  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;">
      <div style="background:linear-gradient(135deg,#00B894,#00A88A);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.2);line-height:48px;font-size:18px;font-weight:700;color:#fff;margin-bottom:12px;">RF</div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">RenewFlow</h1>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Warranty Renewal Platform</p>
      </div>
      <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;border-top:none;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1f36;">Reset your password</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.5;">
          You requested a password reset for your RenewFlow account. Click the button below to choose a new password.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:linear-gradient(135deg,#00B894,#00A88A);color:#fff;text-decoration:none;padding:14px 32px;border-radius:9px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(0,184,148,0.25);">
            Reset Password
          </a>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
          This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email — your password won't be changed.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${escapeHtml(resetUrl)}" style="color:#00B894;word-break:break-all;">${escapeHtml(resetUrl)}</a>
        </p>
      </div>
      <div style="padding:16px 24px;text-align:center;border-radius:0 0 12px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          &copy; ${new Date().getFullYear()} RenewFlow &middot; <a href="https://renewflow.io" style="color:#00B894;text-decoration:none;">renewflow.io</a>
          <br/>Warranty renewal management for LATAM IT channel partners
        </p>
      </div>
    </div>`;

  return { subject, body, html };
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  const eBrand = escapeHtml(brand);
  const eModel = escapeHtml(model);
  const eSerial = escapeHtml(serial);
  const eClient = escapeHtml(client);
  const eTier = escapeHtml(tier);

  const html = `
    <div style="font-family:'DM Sans',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:${urgencyColor};color:#fff;padding:12px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">⚠ Warranty Expiring — ${days_left} days</h2>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#6b7280;">Device</td><td style="padding:6px 0;font-weight:600;">${eBrand} ${eModel}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Serial</td><td style="padding:6px 0;">${eSerial}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Client</td><td style="padding:6px 0;">${eClient}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Tier</td><td style="padding:6px 0;">${eTier}</td></tr>
          ${oem ? `<tr><td style="padding:6px 0;color:#6b7280;">OEM Price</td><td style="padding:6px 0;">$${oem}</td></tr>` : ""}
          ${tpm ? `<tr><td style="padding:6px 0;color:#6b7280;">TPM Price</td><td style="padding:6px 0;">$${tpm}</td></tr>` : ""}
        </table>
        <div style="margin-top:16px;padding:12px;background:#f3f4f6;border-radius:6px;">
          <strong>Recommendation:</strong> ${escapeHtml(recommendation)}
        </div>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent by RenewFlow</p>
    </div>`;

  return { subject, body, html };
}

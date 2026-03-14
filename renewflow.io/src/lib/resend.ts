import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || "RenewFlow <noreply@renewflow.io>";

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
  html?: string,
): Promise<{ id: string }> {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: DEFAULT_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html: html || text,
  });
  if (error) throw new Error(error.message);
  return { id: data!.id };
}

// ─── Branded Email Templates ───

export function buildPasswordResetEmail(resetUrl: string): { subject: string; text: string; html: string } {
  const subject = "Reset your RenewFlow password";
  const text = `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`;
  const html = `
    <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:#2563EB;color:#fff;font-weight:700;font-size:18px;padding:8px 16px;border-radius:8px">RF</div>
        <h2 style="color:#1E293B;margin:12px 0 4px;font-size:20px">RenewFlow</h2>
      </div>
      <p style="color:#334155;font-size:14px;line-height:1.6">You requested a password reset. Click the button below to set a new password:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Reset Password</a>
      </div>
      <p style="color:#64748B;font-size:12px;line-height:1.5">This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #E3E8F0;margin:24px 0"/>
      <p style="color:#94A3B8;font-size:11px;text-align:center">RenewFlow &mdash; AI-native warranty renewal platform</p>
    </div>`;
  return { subject, text, html };
}

export function buildWarrantyAlertEmail(
  assets: Array<{ brand: string; model: string; serial: string; client: string; daysLeft: number; tpm: number }>,
): { subject: string; text: string; html: string } {
  const urgentCount = assets.filter((a) => a.daysLeft <= 7).length;
  const subject = `RenewFlow: ${assets.length} device${assets.length > 1 ? "s" : ""} expiring soon${urgentCount ? ` (${urgentCount} critical)` : ""}`;

  const rows = assets
    .map((a) => {
      const color = a.daysLeft <= 7 ? "#DC2626" : a.daysLeft <= 30 ? "#E8890C" : "#2563EB";
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #E3E8F0;font-size:13px">${a.brand} ${a.model}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E3E8F0;font-size:13px">${a.serial}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E3E8F0;font-size:13px">${a.client}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E3E8F0;font-size:13px;color:${color};font-weight:600">${a.daysLeft}d</td>
        <td style="padding:8px 12px;border-bottom:1px solid #E3E8F0;font-size:13px">$${a.tpm}</td>
      </tr>`;
    })
    .join("");

  const text = assets.map((a) => `${a.brand} ${a.model} (${a.serial}) — ${a.client} — ${a.daysLeft} days — $${a.tpm} TPM`).join("\n");

  const html = `
    <div style="font-family:'DM Sans',system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;border-radius:12px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <div style="background:#2563EB;color:#fff;font-weight:700;font-size:14px;padding:6px 12px;border-radius:6px">RF</div>
        <h2 style="color:#1E293B;margin:0;font-size:16px">Warranty Alerts</h2>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#F8F9FC">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase">Device</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase">Serial</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase">Client</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase">Expires</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748B;text-transform:uppercase">TPM</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <hr style="border:none;border-top:1px solid #E3E8F0;margin:20px 0"/>
      <p style="color:#94A3B8;font-size:11px;text-align:center">RenewFlow &mdash; AI-native warranty renewal platform</p>
    </div>`;
  return { subject, text, html };
}

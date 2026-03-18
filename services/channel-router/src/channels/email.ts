import { Resend } from "resend";
import { createLogger, requireEnv, optionalEnv } from "@kitz/core";

const logger = createLogger("channel-router:email");

interface EmailPayload {
  to: string;
  template: string;
  vars: Record<string, string>;
  venture_id: string;
}

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = requireEnv("RESEND_API_KEY");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const resend = getResend();
  const fromAddress = optionalEnv("EMAIL_FROM", "noreply@kitz.dev");

  const html = applyTemplate(payload.template, payload.vars);
  const subject = payload.vars["subject"] ?? "Notification";

  logger.info({ to: payload.to, venture_id: payload.venture_id }, "Sending email");

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: payload.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  logger.info({ to: payload.to }, "Email sent");
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

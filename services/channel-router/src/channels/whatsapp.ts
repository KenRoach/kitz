import { createLogger, requireEnv, optionalEnv } from "@kitz/core";

const logger = createLogger("channel-router:whatsapp");

interface WhatsAppPayload {
  to: string;
  template: string;
  vars: Record<string, string>;
  venture_id: string;
}

export async function sendWhatsApp(payload: WhatsAppPayload): Promise<void> {
  const apiUrl = requireEnv("EVOLUTION_API_URL");
  const apiKey = requireEnv("EVOLUTION_API_KEY");

  const body = {
    number: payload.to,
    text: applyTemplate(payload.template, payload.vars),
  };

  logger.info({ to: payload.to, venture_id: payload.venture_id }, "Sending WhatsApp message");

  const res = await fetch(`${apiUrl}/message/sendText/default`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evolution API error ${res.status}: ${text}`);
  }

  logger.info({ to: payload.to }, "WhatsApp message sent");
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

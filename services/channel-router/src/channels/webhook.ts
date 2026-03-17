import { createLogger } from "@kitz/core";

const logger = createLogger("channel-router:webhook");

interface WebhookPayload {
  to: string;
  template: string;
  vars: Record<string, string>;
  venture_id: string;
}

export async function sendWebhook(payload: WebhookPayload): Promise<void> {
  const url = payload.to;

  const body = {
    template: payload.template,
    vars: payload.vars,
    venture_id: payload.venture_id,
  };

  logger.info({ url, venture_id: payload.venture_id }, "Sending webhook");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error ${res.status}: ${text}`);
  }

  logger.info({ url }, "Webhook delivered");
}

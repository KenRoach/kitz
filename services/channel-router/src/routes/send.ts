import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createLogger } from "@kitz/core";
import { sendWhatsApp } from "../channels/whatsapp.js";
import { sendEmail } from "../channels/email.js";
import { sendWebhook } from "../channels/webhook.js";

const logger = createLogger("channel-router:send");

const sendSchema = z.object({
  to: z.string(),
  channel: z.enum(["whatsapp", "email", "webhook"]),
  template: z.string(),
  vars: z.record(z.string()).optional().default({}),
  venture_id: z.string(),
});

export type SendPayload = z.infer<typeof sendSchema>;

export const sendRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: SendPayload }>("/send", async (req, reply) => {
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.message);
    }

    const { to, channel, template, vars, venture_id } = parsed.data;

    logger.info({ to, channel, template, venture_id }, "Routing outbound message");

    try {
      switch (channel) {
        case "whatsapp":
          await sendWhatsApp({ to, template, vars, venture_id });
          break;
        case "email":
          await sendEmail({ to, template, vars, venture_id });
          break;
        case "webhook":
          await sendWebhook({ to, template, vars, venture_id });
          break;
      }

      return { success: true, channel, to };
    } catch (err) {
      logger.error(err, "Failed to send message");
      return reply.internalServerError("Failed to send message");
    }
  });
};

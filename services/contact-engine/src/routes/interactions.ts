import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

export const interactionRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // List interactions for a contact
  app.get<{ Querystring: { contact_id: string } }>("/", async (req, reply) => {
    if (!req.query.contact_id) return reply.badRequest("contact_id is required");
    return db.interaction.findMany({
      where: { contactId: req.query.contact_id },
      orderBy: { createdAt: "desc" },
    });
  });

  // Log a new interaction
  app.post<{
    Body: {
      contactId: string;
      ventureId: string;
      channel: string;
      direction: string;
      content: string;
      metadata?: Record<string, unknown>;
    };
  }>("/", async (req) => {
    const { contactId, ventureId, channel, direction, content, metadata } = req.body;
    return db.interaction.create({
      data: {
        contactId,
        ventureId,
        channel,
        direction,
        content,
        metadata: metadata || {},
      },
    });
  });
};

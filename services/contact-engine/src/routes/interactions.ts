import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { getDB } from "@kitz/core";
import { z } from "zod";

const CreateInteraction = z.object({
  contactId: z.string().min(1),
  ventureId: z.string().min(1),
  channel: z.string().min(1),
  direction: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional().default({}),
});

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
      metadata?: Prisma.InputJsonValue;
    };
  }>("/", async (req, reply) => {
    const parsed = CreateInteraction.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const { contactId, ventureId, channel, direction, content, metadata } = parsed.data;
    return db.interaction.create({
      data: {
        contactId,
        ventureId,
        channel,
        direction,
        content,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
      },
    });
  });

  // Get a single interaction by id
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const record = await db.interaction.findUnique({ where: { id: req.params.id } });
    if (!record) return reply.notFound("interaction not found");
    return record;
  });

  // Delete an interaction
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const record = await db.interaction.findUnique({ where: { id: req.params.id } });
    if (!record) return reply.notFound("interaction not found");
    await db.interaction.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};

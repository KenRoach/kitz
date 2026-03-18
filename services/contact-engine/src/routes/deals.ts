import type { FastifyPluginAsync } from "fastify";
import type { DealStage, Prisma } from "@prisma/client";
import { getDB } from "@kitz/core";
import { z } from "zod";

const CreateDeal = z.object({
  ventureId: z.string().min(1),
  contactId: z.string().min(1),
  title: z.string().min(1, "title is required"),
  stage: z.enum(["identified", "contacted", "qualified", "quoted", "negotiation", "closed_won", "closed_lost"]).optional().default("identified"),
  value: z.number().min(0).optional().default(0),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const dealRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // List deals scoped by venture_id, optionally filtered by stage
  app.get<{ Querystring: { venture_id: string; stage?: string } }>(
    "/",
    async (req, reply) => {
      if (!req.query.venture_id) return reply.badRequest("venture_id is required");
      const where: Record<string, unknown> = { ventureId: req.query.venture_id };
      if (req.query.stage) where.stage = req.query.stage;
      return db.deal.findMany({ where, orderBy: { createdAt: "desc" } });
    },
  );

  // Create a deal
  app.post<{
    Body: {
      ventureId: string;
      contactId: string;
      title: string;
      stage?: DealStage;
      value?: number;
      metadata?: Prisma.InputJsonValue;
    };
  }>("/", async (req, reply) => {
    const parsed = CreateDeal.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const { ventureId, contactId, title, stage, value, metadata } = parsed.data;
    return db.deal.create({
      data: {
        ventureId,
        contactId,
        title,
        stage: stage || "identified",
        value: value || 0,
        metadata: (metadata || {}) as Prisma.InputJsonValue,
      },
    });
  });

  // Get a single deal by id
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const record = await db.deal.findUnique({ where: { id: req.params.id } });
    if (!record) return reply.notFound("deal not found");
    return record;
  });

  // Update a deal (stage transitions, etc.)
  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/:id",
    async (req, reply) => {
      const deal = await db.deal.findUnique({ where: { id: req.params.id } });
      if (!deal) return reply.notFound("Deal not found");
      return db.deal.update({ where: { id: req.params.id }, data: req.body });
    },
  );

  // Delete a deal
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const record = await db.deal.findUnique({ where: { id: req.params.id } });
    if (!record) return reply.notFound("deal not found");
    await db.deal.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};

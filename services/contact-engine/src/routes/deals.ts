import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

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
      stage?: string;
      value?: number;
      meta?: Record<string, unknown>;
    };
  }>("/", async (req) => {
    const { ventureId, contactId, title, stage, value, meta } = req.body;
    return db.deal.create({
      data: {
        ventureId,
        contactId,
        title,
        stage: stage || "lead",
        value: value || 0,
        meta: meta || {},
      },
    });
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
};

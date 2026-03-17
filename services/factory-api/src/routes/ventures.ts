import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

export const ventureRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  app.get("/", async () => {
    return db.venture.findMany({ orderBy: { createdAt: "desc" } });
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const venture = await db.venture.findUnique({ where: { id: req.params.id } });
    if (!venture) return reply.notFound("Venture not found");
    return venture;
  });

  app.post<{ Body: { name: string; slug: string; description?: string } }>("/", async (req) => {
    return db.venture.create({
      data: {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description || "",
      },
    });
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>("/:id", async (req, reply) => {
    const venture = await db.venture.findUnique({ where: { id: req.params.id } });
    if (!venture) return reply.notFound("Venture not found");
    return db.venture.update({ where: { id: req.params.id }, data: req.body });
  });
};

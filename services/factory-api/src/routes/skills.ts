import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

export const skillRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  app.get<{ Querystring: { venture_id?: string } }>("/", async (req) => {
    const where = req.query.venture_id ? { ventureId: req.query.venture_id } : {};
    return db.skill.findMany({ where, orderBy: { createdAt: "desc" } });
  });

  app.post<{
    Body: { ventureId: string; name: string; slug: string; description?: string };
  }>("/", async (req) => {
    return db.skill.create({
      data: {
        ventureId: req.body.ventureId,
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description || "",
      },
    });
  });
};

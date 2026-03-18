import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

const CreateSkill = z.object({
  ventureId: z.string().min(1, "ventureId is required"),
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required").regex(/^[a-z0-9-]+$/),
  description: z.string().optional().default(""),
});

export const skillRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  app.get<{ Querystring: { venture_id?: string } }>("/", async (req) => {
    const where = req.query.venture_id ? { ventureId: req.query.venture_id } : {};
    return db.skill.findMany({ where, orderBy: { createdAt: "desc" } });
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const skill = await db.skill.findUnique({ where: { id: req.params.id } });
    if (!skill) return reply.notFound("Skill not found");
    return skill;
  });

  app.post<{
    Body: { ventureId: string; name: string; slug: string; description?: string };
  }>("/", async (req, reply) => {
    const parsed = CreateSkill.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    return db.skill.create({
      data: {
        ventureId: parsed.data.ventureId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
      },
    });
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const skill = await db.skill.findUnique({ where: { id: req.params.id } });
    if (!skill) return reply.notFound("Skill not found");
    await db.skill.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};

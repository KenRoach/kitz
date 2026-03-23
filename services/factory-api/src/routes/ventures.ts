import { z } from "zod";
import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

const CreateVenture = z.object({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required").regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional().default(""),
});

const UpdateVenture = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  config: z.record(z.any()).optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field required");

export const ventureRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // Tenant-isolated listing: requires x-org-id header or ?org_id query param.
  // Callers must supply the authenticated user's org_id to restrict results.
  app.get<{ Querystring: { org_id?: string } }>("/", async (req, reply) => {
    const orgId =
      (req.headers["x-org-id"] as string | undefined) ??
      req.query.org_id;

    if (!orgId) {
      return reply.badRequest("org_id is required (pass x-org-id header or ?org_id query param)");
    }

    return db.venture.findMany({
      where: { id: orgId },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const orgId = req.headers["x-org-id"] as string | undefined;
    const venture = await db.venture.findUnique({ where: { id: req.params.id } });
    if (!venture) return reply.notFound("Venture not found");
    // Enforce tenant isolation: if org_id is provided, ensure it matches
    if (orgId && venture.id !== orgId) {
      return reply.notFound("Venture not found");
    }
    return venture;
  });

  app.post<{ Body: { name: string; slug: string; description?: string } }>("/", async (req, reply) => {
    const parsed = CreateVenture.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const { name, slug, description } = parsed.data;
    return db.venture.create({
      data: {
        name,
        slug,
        description,
      },
    });
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>("/:id", async (req, reply) => {
    const orgId = req.headers["x-org-id"] as string | undefined;
    const venture = await db.venture.findUnique({ where: { id: req.params.id } });
    if (!venture) return reply.notFound("Venture not found");
    if (orgId && venture.id !== orgId) return reply.notFound("Venture not found");
    const parsed = UpdateVenture.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return db.venture.update({ where: { id: req.params.id }, data: parsed.data as any });
  });

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const orgId = req.headers["x-org-id"] as string | undefined;
    const venture = await db.venture.findUnique({ where: { id: req.params.id } });
    if (!venture) return reply.notFound("Venture not found");
    if (orgId && venture.id !== orgId) return reply.notFound("Venture not found");
    await db.venture.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};

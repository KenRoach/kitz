import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getDB } from "@kitz/core";

const CreateAsset = z.object({
  ventureId: z.string().min(1),
  contactId: z.string().optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  serial: z.string().min(1),
  deviceType: z.string().optional(),
  tier: z.enum(["critical", "standard", "low-use", "eol"]).default("standard"),
  warrantyEnd: z.string().optional(),
  purchaseDate: z.string().optional(),
  oem: z.number().optional(),
  tpm: z.number().optional(),
  quantity: z.number().int().min(1).default(1),
  metadata: z.record(z.unknown()).optional().default({}),
});

const BulkImport = z.object({
  ventureId: z.string().min(1),
  assets: z.array(CreateAsset.omit({ ventureId: true })),
});

export const assetRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // List assets by venture
  app.get<{ Querystring: { venture_id: string } }>("/", async (req, reply) => {
    if (!req.query.venture_id) return reply.badRequest("venture_id is required");
    return db.asset.findMany({
      where: { ventureId: req.query.venture_id },
      orderBy: { createdAt: "desc" },
    });
  });

  // Get single asset
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    return asset;
  });

  // Create single asset
  app.post("/", async (req, reply) => {
    const parsed = CreateAsset.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const data = parsed.data;
    return db.asset.create({
      data: {
        ...data,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        metadata: data.metadata as any || {},
      },
    });
  });

  // Bulk import assets
  app.post("/bulk", async (req, reply) => {
    const parsed = BulkImport.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const { ventureId, assets } = parsed.data;
    const created = await db.asset.createMany({
      data: assets.map(a => ({
        ventureId,
        ...a,
        warrantyEnd: a.warrantyEnd ? new Date(a.warrantyEnd) : null,
        purchaseDate: a.purchaseDate ? new Date(a.purchaseDate) : null,
        metadata: a.metadata as any || {},
      })),
      skipDuplicates: true,
    });
    return { imported: created.count };
  });

  // Update asset
  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    return db.asset.update({ where: { id: req.params.id }, data: req.body as any });
  });

  // Delete asset
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    await db.asset.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};

import type { FastifyPluginAsync } from "fastify";
import type { Prisma } from "@prisma/client";
import { getDB } from "@kitz/core";

export const contactRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // List contacts scoped by venture_id
  app.get<{ Querystring: { venture_id: string } }>("/", async (req, reply) => {
    if (!req.query.venture_id) return reply.badRequest("venture_id is required");
    return db.contact.findMany({
      where: { ventureId: req.query.venture_id },
      orderBy: { createdAt: "desc" },
    });
  });

  // Get a single contact by id
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const contact = await db.contact.findUnique({ where: { id: req.params.id } });
    if (!contact) return reply.notFound("Contact not found");
    return contact;
  });

  // Create a contact with dedup on (email OR phone) + venture_id
  app.post<{
    Body: {
      ventureId: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      company?: string;
      metadata?: Prisma.InputJsonValue;
    };
  }>("/", async (req, reply) => {
    const { ventureId, firstName, lastName, email, phone, company, metadata } = req.body;

    // Dedup: check for existing contact with same email or phone within venture
    if (email || phone) {
      const conditions: Record<string, unknown>[] = [];
      if (email) conditions.push({ email, ventureId });
      if (phone) conditions.push({ phone, ventureId });

      const existing = await db.contact.findFirst({
        where: { OR: conditions },
      });

      if (existing) {
        return reply.conflict(
          `Contact already exists with matching ${existing.email === email ? "email" : "phone"}`,
        );
      }
    }

    return db.contact.create({
      data: {
        ventureId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        company: company || null,
        metadata: metadata || {},
      },
    });
  });

  // Update a contact
  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/:id",
    async (req, reply) => {
      const contact = await db.contact.findUnique({ where: { id: req.params.id } });
      if (!contact) return reply.notFound("Contact not found");
      return db.contact.update({ where: { id: req.params.id }, data: req.body });
    },
  );
};

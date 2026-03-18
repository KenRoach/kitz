import type { FastifyPluginAsync } from "fastify";
import { getDB } from "@kitz/core";

export const logRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  app.get<{ Querystring: { venture_id?: string } }>("/", async (req) => {
    const where = req.query.venture_id ? { ventureId: req.query.venture_id } : {};
    return db.agentLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  });
};

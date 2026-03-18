import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const SKIP_PATHS = ["/health"];

export function registerAuth(app: FastifyInstance) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return; // Auth disabled if no API_KEY set

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (SKIP_PATHS.includes(request.url)) return;
    if (request.method === "OPTIONS") return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authorization required" });
    }

    const token = authHeader.slice(7);
    if (token !== apiKey) {
      return reply.status(401).send({ error: "Invalid API key" });
    }
  });
}

/** Tool invocation route — POST /v0.1/tools/:name/invoke */

import type { FastifyInstance } from "fastify";
import { ToolRegistry, ToolNotFoundError } from "../tools/registry.js";
import { getSupabase } from "../db/client.js";
import { validateToken } from "../auth/service.js";

export async function toolRoutes(app: FastifyInstance, registry: ToolRegistry): Promise<void> {
  // List all tools
  app.get("/v0.1/tools", async () => {
    return { tools: registry.list() };
  });

  // Health check with DB connectivity (served at both /health and /v0.1/health)
  const healthHandler = async () => {
    try {
      const db = getSupabase();
      await db.from("users").select("id", { count: "exact", head: true });
      return { status: "ok", service: "kitz-gateway", version: "0.1", db: "connected" };
    } catch {
      return { status: "degraded", service: "kitz-gateway", version: "0.1", db: "unreachable" };
    }
  };
  app.get("/health", healthHandler);
  app.get("/v0.1/health", healthHandler);

  // Invoke a tool (rate-limited to prevent LLM/DB resource exhaustion)
  app.post<{ Params: { name: string } }>(
    "/v0.1/tools/:name/invoke",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const { name } = request.params;
      const body = (request.body as { args?: Record<string, unknown> }) ?? {};
      const args = body.args ?? {};

      // Auth: reject unauthenticated requests
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Authorization required" });
      }
      const token = authHeader.slice(7);
      const user = await validateToken(token);
      if (!user) {
        return reply.status(401).send({ error: "Invalid or expired token" });
      }
      // Enforce org_id server-side
      if (user.org_id) {
        args.org_id = user.org_id;
      }

      try {
        const result = await registry.invoke(name, args);
        return { tool: name, result };
      } catch (err) {
        if (err instanceof ToolNotFoundError) {
          return reply.status(404).send({ error: err.message });
        }
        const message = err instanceof Error ? err.message : "Internal error";
        const status = message.includes("required") || message.includes("must be") ? 400 : 500;
        return reply.status(status).send({ error: message });
      }
    },
  );
}

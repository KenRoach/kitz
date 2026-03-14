/** Tool invocation route — POST /v0.1/tools/:name/invoke */

import type { FastifyInstance } from "fastify";
import { ToolRegistry, ToolNotFoundError } from "../tools/registry.js";
import { getSupabase } from "../db/client.js";

export async function toolRoutes(app: FastifyInstance, registry: ToolRegistry): Promise<void> {
  // List all tools
  app.get("/v0.1/tools", async () => {
    return { tools: registry.list() };
  });

  // Health check with DB connectivity
  app.get("/v0.1/health", async () => {
    try {
      const db = getSupabase();
      await db.from("users").select("id", { count: "exact", head: true });
      return { status: "ok", version: "0.1", db: "connected" };
    } catch {
      return { status: "degraded", version: "0.1", db: "unreachable" };
    }
  });

  // Invoke a tool
  app.post<{ Params: { name: string } }>("/v0.1/tools/:name/invoke", async (request, reply) => {
    const { name } = request.params;
    const body = (request.body as { args?: Record<string, unknown> }) ?? {};
    const args = body.args ?? {};

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
  });
}

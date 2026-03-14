/** Tool invocation route — POST /v0.1/tools/:name/invoke */

import type { FastifyInstance } from "fastify";
import { ToolRegistry, ToolNotFoundError } from "../tools/registry.js";

export async function toolRoutes(app: FastifyInstance, registry: ToolRegistry): Promise<void> {
  // List all tools
  app.get("/v0.1/tools", async () => {
    return { tools: registry.list() };
  });

  // Health check
  app.get("/v0.1/health", async () => {
    return { status: "ok", version: "0.1" };
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
      if (err instanceof Error && err.message.includes("must be")) {
        return reply.status(400).send({ error: err.message });
      }
      throw err;
    }
  });
}

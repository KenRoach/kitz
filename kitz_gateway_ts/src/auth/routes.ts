/** Auth routes — login, register, reset-password. */

import type { FastifyInstance } from "fastify";
import { login, registerUser, resetPassword } from "./service.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v0.1/auth/login", async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    if (!username || !password) {
      return reply.status(400).send({ error: "username and password required" });
    }
    try {
      const result = await login(username, password);
      return result;
    } catch (err) {
      return reply.status(401).send({ error: (err as Error).message });
    }
  });

  app.post("/v0.1/auth/register", async (request, reply) => {
    const { username, password } = request.body as { username: string; password: string };
    if (!username || !password) {
      return reply.status(400).send({ error: "username and password required" });
    }
    try {
      return await registerUser(username, password);
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  app.post("/v0.1/auth/reset-password", async (request, reply) => {
    const { username, currentPassword, newPassword } = request.body as {
      username: string;
      currentPassword: string;
      newPassword: string;
    };
    if (!username || !currentPassword || !newPassword) {
      return reply.status(400).send({ error: "username, currentPassword, and newPassword required" });
    }
    try {
      return await resetPassword(username, currentPassword, newPassword);
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });
}

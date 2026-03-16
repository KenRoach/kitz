/** Auth routes — login, register, reset-password, forgot-password. */

import type { FastifyInstance } from "fastify";
import { login, registerUser, resetPassword, forgotPassword, resetPasswordWithToken } from "./service.js";
import { loadConfig } from "../config.js";

function registerAuthHandlers(app: FastifyInstance, prefix: string): void {
  app.post(`${prefix}/login`, async (request, reply) => {
    const body = request.body as { username?: string; email?: string; password: string };
    const username = body.username || body.email;
    const { password } = body;
    if (!username || !password) {
      return reply.status(400).send({ error: "username/email and password required" });
    }
    try {
      const result = await login(username, password);
      return result;
    } catch (err) {
      return reply.status(401).send({ error: (err as Error).message });
    }
  });

  app.post(`${prefix}/register`, async (request, reply) => {
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

  app.post(`${prefix}/reset-password`, async (request, reply) => {
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

  app.post(`${prefix}/forgot-password`, async (request, reply) => {
    const { email } = request.body as { email: string };
    if (!email) {
      return reply.status(400).send({ error: "email is required" });
    }
    try {
      const config = loadConfig();
      const baseUrl = config.appUrl;
      return await forgotPassword(email, baseUrl);
    } catch (err) {
      // Always return success to prevent user enumeration
      request.log.error(err, "forgot-password error");
      return { sent: true };
    }
  });

  app.post(`${prefix}/reset-password-with-token`, async (request, reply) => {
    const { token, newPassword } = request.body as { token: string; newPassword: string };
    if (!token || !newPassword) {
      return reply.status(400).send({ error: "token and newPassword are required" });
    }
    try {
      return await resetPasswordWithToken(token, newPassword);
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  registerAuthHandlers(app, "/v0.1/auth");
  registerAuthHandlers(app, "/api/v1/auth");
}

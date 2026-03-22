/** Fastify auth plugin — Bearer token validation middleware. */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { validateToken, type AuthUser } from "./service.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}

async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorate("authEnabled", false);

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for health, tool listing, auth routes, static files, and OPTIONS
    const path = request.url.split("?")[0];
    if (
      request.method === "OPTIONS" ||
      path === "/v0.1/health" ||
      path === "/v0.1/tools" ||
      path.startsWith("/v0.1/auth/") ||
      path.startsWith("/api/v1/auth/") ||
      // Allow workspace creation without auth (onboarding)
      (request.method === "POST" && path === "/v0.1/ventures") ||
      // Skip auth for static assets and SPA routes (non-API paths)
      path.startsWith("/assets/") ||
      path === "/" ||
      path === "/favicon.svg" ||
      (!path.startsWith("/v0.1/") && !path.startsWith("/api/"))
    ) {
      return;
    }

    if (!(app as unknown as { authEnabled: boolean }).authEnabled) return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authorization required" });
    }

    const token = authHeader.slice(7);
    const user = await validateToken(token);
    if (!user) {
      return reply.status(401).send({ error: "Invalid or expired token" });
    }

    request.authUser = user;
  });
}

export default fp(authPlugin, { name: "auth" });

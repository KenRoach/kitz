/**
 * RenewFlow production server — serves the Vite SPA and proxies /api/* to the gateway.
 *
 * Replaces the Vercel serverless proxy with a single container on Railway.
 *
 * Env vars:
 *   PORT        — listen port (default 3000)
 *   GATEWAY_URL — backend gateway base URL (e.g. http://kitz-gateway.railway.internal:8787)
 */

import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import httpProxy from "@fastify/http-proxy";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:8787";

const app = Fastify({ logger: true });

// Proxy /api/* → GATEWAY_URL/v0.1/*
// This preserves the browser's same-origin /api contract
await app.register(httpProxy, {
  upstream: GATEWAY_URL,
  prefix: "/api",
  rewritePrefix: "/v0.1",
  http2: false,
});

// Serve built SPA from dist/
await app.register(fastifyStatic, {
  root: join(__dirname, "dist"),
  prefix: "/",
  wildcard: false,
});

// Health check
app.get("/health", async () => ({ status: "ok", service: "renewflo" }));

// SPA fallback — serve index.html for all unmatched GET requests
app.setNotFoundHandler(async (request, reply) => {
  if (request.method === "GET" && !request.url.startsWith("/api/")) {
    return reply.sendFile("index.html");
  }
  return reply.status(404).send({ error: "Not found" });
});

await app.listen({ port: PORT, host: "0.0.0.0" });
console.log(`RenewFlow server ready on port ${PORT} → gateway ${GATEWAY_URL}`);

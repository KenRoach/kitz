/** KitZ OS Gateway — AI orchestration engine. */

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { loadConfig } from "./config.js";
import { initSupabase } from "./db/client.js";
import { initDefaultAdmin } from "./auth/service.js";
import authPlugin from "./auth/plugin.js";
import { authRoutes } from "./auth/routes.js";
import { ToolRegistry } from "./tools/registry.js";
import { builtinTools } from "./tools/builtin.js";
import { quoterTools, initAnthropic } from "./tools/quoter.js";
import { toolRoutes } from "./routes/tools.js";
import { aiRoutes } from "./routes/ai.js";
import { webhookRoutes } from "./routes/webhooks.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Initialize Supabase
  initSupabase(config.supabaseUrl, config.supabaseServiceKey);

  // Configure AI engine
  if (config.anthropicApiKey) {
    initAnthropic(config.anthropicApiKey);
  }

  // Seed default admin user
  await initDefaultAdmin();

  // Build tool registry — KitZ OS retains AI tools only
  const registry = new ToolRegistry();
  const allTools = [
    ...builtinTools,
    ...quoterTools,
  ];
  for (const tool of allTools) {
    registry.register(tool);
  }

  // Create Fastify server
  const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // Security headers
  await app.register(helmet, { contentSecurityPolicy: false });

  // CORS — restrict to configured origins or same-origin
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") ?? [];
  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
  });

  // Auth middleware
  await app.register(authPlugin);
  (app as unknown as { authEnabled: boolean }).authEnabled = config.authEnabled;

  // Auth routes (login, register, reset-password)
  await app.register(authRoutes);

  // Tool routes (health, list, invoke)
  await app.register(async (instance) => toolRoutes(instance, registry));

  // AI API routes (called by RenewFlow via API key)
  await app.register(aiRoutes);

  // Webhook routes (async processing for RenewFlow)
  await app.register(webhookRoutes);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`${signal} received — shutting down`);
    await app.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  // Start
  const features = [
    config.authEnabled ? "auth" : null,
    config.anthropicApiKey ? "ai" : null,
  ].filter(Boolean);

  await app.listen({ port: config.port, host: config.host });
  app.log.info(
    `KitZ OS v0.1 ready on port ${config.port} [${features.join(", ")}]`
  );
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

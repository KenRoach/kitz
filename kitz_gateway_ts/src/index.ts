/** Kitz Gateway — AI orchestration engine for RenewFlow. */

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import path from "node:path";

import { loadConfig } from "./config.js";
import { initSupabase } from "./db/client.js";
import { initDefaultAdmin } from "./auth/service.js";
import authPlugin from "./auth/plugin.js";
import { authRoutes } from "./auth/routes.js";
import { ToolRegistry } from "./tools/registry.js";
import { builtinTools } from "./tools/builtin.js";
import { assetTools } from "./tools/assets.js";
import { insightTools } from "./tools/insights.js";
import { orderTools } from "./tools/orders.js";
import { ticketTools } from "./tools/tickets.js";
import { inboxTools } from "./tools/inbox.js";
import { rewardTools } from "./tools/rewards.js";
import { emailTools } from "./tools/email.js";
import { quoterTools, initAnthropic } from "./tools/quoter.js";
import { partnerTools } from "./tools/partners.js";
import { toolRoutes } from "./routes/tools.js";
import { configure as configureMail } from "./services/mailer.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Initialize Supabase
  initSupabase(config.supabaseUrl, config.supabaseServiceKey);

  // Configure Anthropic AI (Kitz OS)
  if (config.anthropicApiKey) {
    initAnthropic(config.anthropicApiKey);
  }

  // Configure SMTP if available
  if (config.smtp.host) {
    configureMail(config.smtp.host, config.smtp.port, config.smtp.user, config.smtp.pass, config.smtp.from);
  }

  // Seed default admin user
  await initDefaultAdmin();

  // Build tool registry
  const registry = new ToolRegistry();
  const allTools = [
    ...builtinTools,
    ...assetTools,
    ...insightTools,
    ...orderTools,
    ...ticketTools,
    ...inboxTools,
    ...rewardTools,
    ...emailTools,
    ...quoterTools,
    ...partnerTools,
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

  // CORS
  await app.register(cors, { origin: true });

  // Rate limiting on auth endpoints
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

  // Static file serving (SPA fallback)
  if (config.staticDir) {
    const root = path.resolve(config.staticDir);
    await app.register(fastifyStatic, {
      root,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback — serve index.html for unmatched routes
    app.setNotFoundHandler(async (_request, reply) => {
      return reply.sendFile("index.html", root);
    });
  }

  // Start
  const features = [
    config.authEnabled ? "auth" : null,
    config.anthropicApiKey ? "kitz-os" : null,
    config.smtp.host ? `smtp: ${config.smtp.host}` : null,
    config.staticDir ? `static: ${config.staticDir}` : null,
  ].filter(Boolean);

  await app.listen({ port: config.port, host: config.host });
  console.log(
    `Kitz Gateway v0.1 listening on http://${config.host}:${config.port}` +
    (features.length > 0 ? ` [${features.join("] [")}]` : "")
  );
}

main().catch((err) => {
  console.error("Failed to start Kitz Gateway:", err);
  process.exit(1);
});

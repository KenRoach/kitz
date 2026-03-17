/** KitZ(OS) Gateway — AI Business OS powered by multi-LLM orchestration. */

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
import { businessTools } from "./tools/business/index.js";
import { toolRoutes } from "./routes/tools.js";
import { configure as configureMail } from "./services/mailer.js";
import { initLlmRouter } from "./llm/router.js";
import { messagingRoutes, getWhatsAppAdapter } from "./messaging/routes.js";
import { runMigrations } from "./db/migrate.js";
import { initTranscriber } from "./voice/transcriber.js";
import { initScheduler } from "./scheduler/index.js";
import { initWarrantyScheduler } from "./scheduler/warrantyScheduler.js";
import { partnerPortalRoutes } from "./routes/partner-portal.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Initialize Supabase
  initSupabase(config.supabaseUrl, config.supabaseServiceKey);

  // Configure AI engine (legacy Anthropic singleton for quoter)
  if (config.anthropicApiKey) {
    initAnthropic(config.anthropicApiKey);
  }

  // Initialize multi-LLM router
  const llmRouter = initLlmRouter({
    anthropicApiKey: config.anthropicApiKey,
    openaiApiKey: config.openaiApiKey,
    geminiApiKey: config.geminiApiKey,
    defaultLlmProvider: config.defaultLlmProvider,
  });

  // Initialize voice transcriber
  if (config.elevenlabsApiKey) {
    initTranscriber(config.elevenlabsApiKey);
  }

  // Configure SMTP if available
  if (config.smtp.host) {
    configureMail(config.smtp.host, config.smtp.port, config.smtp.user, config.smtp.pass, config.smtp.from);
  }

  // Run database migrations if DATABASE_URL is configured
  await runMigrations(config.databaseUrl);

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
    ...businessTools,
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

  // Partner portal (read-only PO view for delivery partners)
  await app.register(partnerPortalRoutes);

  // Messaging routes (WhatsApp, outbound, drafts)
  await app.register(async (instance) =>
    messagingRoutes(instance, {
      sessionDir: config.whatsappSessionDir,
      tools: allTools,
    }),
  );

  // Static file serving (SPA fallback)
  if (config.staticDir) {
    const root = path.resolve(config.staticDir);
    await app.register(fastifyStatic, {
      root,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback — serve index.html for unmatched GET requests (not API calls)
    app.setNotFoundHandler(async (request, reply) => {
      if (request.method === "GET" && !request.url.startsWith("/v0.1/")) {
        return reply.sendFile("index.html", root);
      }
      return reply.status(404).send({ error: "Not found" });
    });
  }

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
    `llm:${llmRouter.getAvailableProviders().join("+")}`,
    config.elevenlabsApiKey ? "voice" : null,
    config.smtp.host ? "smtp" : null,
    config.staticDir ? "static" : null,
    "whatsapp",
    "scheduler",
  ].filter(Boolean);

  await app.listen({ port: config.port, host: config.host });

  // Start scheduler after server is listening (needs WhatsApp adapter)
  const adapter = getWhatsAppAdapter();
  if (adapter) {
    initScheduler(adapter);
  }

  // Start RenewFlow warranty alert scheduler (runs daily, independent of WhatsApp)
  initWarrantyScheduler();

  app.log.info(
    `KitZ(OS) Gateway v0.1 ready on port ${config.port} [${features.join(", ")}]`
  );
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

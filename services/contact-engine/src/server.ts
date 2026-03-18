import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { loadEnv, createLogger, registerAuth } from "@kitz/core";
import { contactRoutes } from "./routes/contacts.js";
import { dealRoutes } from "./routes/deals.js";
import { interactionRoutes } from "./routes/interactions.js";

loadEnv();

const logger = createLogger("contact-engine");
const PORT = parseInt(process.env.PORT || "3003", 10);

const app = Fastify({ logger: false });

await app.register(sensible);
await app.register(cors, { origin: true });
registerAuth(app);

app.get("/health", async () => ({ status: "ok", service: "contact-engine" }));

await app.register(contactRoutes, { prefix: "/contacts" });
await app.register(dealRoutes, { prefix: "/deals" });
await app.register(interactionRoutes, { prefix: "/interactions" });

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`contact-engine running on port ${PORT}`);
} catch (err) {
  logger.error(err, "Failed to start contact-engine");
  process.exit(1);
}

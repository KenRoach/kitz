import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { loadEnv, createLogger, registerAuth } from "@kitz/core";
import { sendRoutes } from "./routes/send.js";

loadEnv();

const logger = createLogger("channel-router");
const PORT = parseInt(process.env.PORT || "3004", 10);

const app = Fastify({ logger: false });

await app.register(sensible);
await app.register(cors, { origin: true });
registerAuth(app);

app.get("/health", async () => ({ status: "ok", service: "channel-router" }));

await app.register(sendRoutes);

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`channel-router running on port ${PORT}`);
} catch (err) {
  logger.error(err, "Failed to start channel-router");
  process.exit(1);
}

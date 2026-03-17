import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { loadEnv, createLogger } from "@kitz/core";
import { executeRoutes } from "./routes/execute.js";

loadEnv();

const logger = createLogger("agent-runtime");
const PORT = parseInt(process.env.PORT || "3001", 10);

const app = Fastify({ logger: false });

await app.register(sensible);
await app.register(cors, { origin: true });

app.get("/health", async () => ({ status: "ok", service: "agent-runtime" }));

await app.register(executeRoutes, { prefix: "/execute" });

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`agent-runtime running on port ${PORT}`);
} catch (err) {
  logger.error(err, "Failed to start agent-runtime");
  process.exit(1);
}

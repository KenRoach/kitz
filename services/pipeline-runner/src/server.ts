import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { loadEnv, createLogger, registerAuth } from "@kitz/core";
import { pipelineRoutes } from "./routes/pipelines.js";
import { startWorker } from "./worker.js";

loadEnv();

const logger = createLogger("pipeline-runner");
const PORT = parseInt(process.env.PORT || "3002", 10);

const app = Fastify({ logger: false });

await app.register(sensible);
await app.register(cors, { origin: true });
registerAuth(app);

app.get("/health", async () => ({ status: "ok", service: "pipeline-runner" }));

await app.register(pipelineRoutes, { prefix: "/pipelines" });

startWorker();

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`pipeline-runner running on port ${PORT}`);
} catch (err) {
  logger.error(err, "Failed to start pipeline-runner");
  process.exit(1);
}

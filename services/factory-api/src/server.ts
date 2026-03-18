import Fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import { loadEnv, createLogger, registerAuth } from "@kitz/core";
import { ventureRoutes } from "./routes/ventures.js";
import { skillRoutes } from "./routes/skills.js";

loadEnv();

const logger = createLogger("factory-api");
const PORT = parseInt(process.env.PORT || "3000", 10);

const app = Fastify({ logger: false });

await app.register(sensible);
await app.register(cors, { origin: true });
registerAuth(app);

app.get("/health", async () => ({ status: "ok", service: "factory-api" }));

await app.register(ventureRoutes, { prefix: "/ventures" });
await app.register(skillRoutes, { prefix: "/skills" });

try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  logger.info(`factory-api running on port ${PORT}`);
} catch (err) {
  logger.error(err, "Failed to start factory-api");
  process.exit(1);
}

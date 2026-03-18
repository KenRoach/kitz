import { Queue } from "bullmq";
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const connection = new (Redis as any)(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const pipelineQueue = new Queue("pipeline-runs", { connection: connection as any });

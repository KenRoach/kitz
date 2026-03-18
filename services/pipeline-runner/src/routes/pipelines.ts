import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getDB } from "@kitz/core";
import { pipelineQueue } from "../queue.js";

const TriggerBody = z.object({
  pipelineId: z.string().uuid(),
  input: z.record(z.unknown()).optional().default({}),
});

export const pipelineRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  /** POST /trigger - enqueue a pipeline run */
  app.post<{ Body: z.infer<typeof TriggerBody> }>("/trigger", async (req, reply) => {
    const parsed = TriggerBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.message);
    }

    const { pipelineId, input } = parsed.data;

    const pipeline = await db.pipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) {
      return reply.notFound("Pipeline not found");
    }

    const run = await db.pipelineRun.create({
      data: {
        pipelineId,
        status: "queued",
        input: input as any,
      },
    });

    await pipelineQueue.add("execute", { runId: run.id, pipelineId, input }, {
      jobId: run.id,
    });

    return reply.status(202).send({ runId: run.id, status: "queued" });
  });

  /** GET /runs/:id - check pipeline run status */
  app.get<{ Params: { id: string } }>("/runs/:id", async (req, reply) => {
    const run = await db.pipelineRun.findUnique({
      where: { id: req.params.id },
      include: { stepResults: true },
    });
    if (!run) return reply.notFound("Pipeline run not found");
    return run;
  });
};

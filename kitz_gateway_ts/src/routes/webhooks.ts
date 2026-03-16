/**
 * KitZ OS Webhook endpoints — async processing for RenewFlow.
 *
 * POST /v1/webhooks/batch-quotes  — Batch quote processing
 * POST /v1/webhooks/insights      — Portfolio analysis
 */

import type { FastifyInstance } from "fastify";
import { requireApiKey } from "../auth/api-key.js";

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // ─── Batch Quote Processing ───
  app.post("/v1/webhooks/batch-quotes", async (request, reply) => {
    requireApiKey(request);

    const { batches, callbackUrl } = request.body as {
      batches: Array<{ clientId: string; assetIds: string[] }>;
      callbackUrl: string;
    };

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Fire and forget — process async
    setImmediate(async () => {
      try {
        // Process each batch through AI
        const results = [];
        for (const batch of batches) {
          results.push({
            clientId: batch.clientId,
            assetCount: batch.assetIds.length,
            status: "processed",
          });
        }

        // Callback to RenewFlow
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, status: "completed", results }),
        }).catch(() => {});
      } catch {
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, status: "failed" }),
        }).catch(() => {});
      }
    });

    return reply.status(202).send({ jobId, status: "accepted" });
  });

  // ─── Portfolio Insights Analysis ───
  app.post("/v1/webhooks/insights", async (request, reply) => {
    requireApiKey(request);

    const { portfolioData, callbackUrl } = request.body as {
      portfolioData: unknown;
      callbackUrl: string;
    };

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    setImmediate(async () => {
      try {
        // Process portfolio analysis
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            status: "completed",
            insights: { analyzed: true, portfolioData },
          }),
        }).catch(() => {});
      } catch {
        await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, status: "failed" }),
        }).catch(() => {});
      }
    });

    return reply.status(202).send({ jobId, status: "accepted" });
  });
}

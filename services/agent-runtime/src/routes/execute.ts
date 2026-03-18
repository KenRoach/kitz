import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { complete, getDB, createLogger } from "@kitz/core";
import type { AgentJobPayload } from "@kitz/core";
import { loadSkill } from "../skill-loader.js";
import { createHash } from "crypto";

const logger = createLogger("execute-route");

const AgentJobSchema = z.object({
  skill: z.string().min(1),
  context: z.record(z.unknown()),
  venture_id: z.string().uuid(),
  language: z.string().min(2).default("en"),
});

function hashInput(input: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 16);
}

export const executeRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  app.post<{ Body: AgentJobPayload }>("/", async (req, reply) => {
    const parsed = AgentJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.message);
    }

    const { skill, context, venture_id, language } = parsed.data;

    // Load the skill prompt template
    let promptTemplate: string;
    try {
      promptTemplate = await loadSkill(venture_id, skill);
    } catch {
      return reply.notFound(`Skill "${skill}" not found for venture ${venture_id}`);
    }

    // Build the prompt by injecting context into the template
    const contextBlock = Object.entries(context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join("\n");

    const prompt = `${promptTemplate}\n\n---\nLanguage: ${language}\nContext:\n${contextBlock}`;

    const startTime = Date.now();
    let output: string;

    try {
      output = await complete(prompt, {
        system: `You are an AI agent executing the "${skill}" skill. Respond in ${language}. Return valid JSON.`,
        maxTokens: 4096,
        temperature: 0.4,
      });
    } catch (err) {
      logger.error({ err, skill, venture_id }, "AI completion failed");
      return reply.internalServerError("AI completion failed");
    }

    const latencyMs = Date.now() - startTime;

    // Parse the output as JSON, fall back to wrapping in a result object
    let structuredOutput: Record<string, unknown>;
    try {
      structuredOutput = JSON.parse(output);
    } catch {
      structuredOutput = { result: output };
    }

    // Log to agent_logs table
    const inputHash = hashInput(context);
    try {
      await db.agentLog.create({
        data: {
          ventureId: venture_id,
          skill,
          inputHash,
          input: context as unknown as Prisma.InputJsonValue,
          output: structuredOutput as unknown as Prisma.InputJsonValue,
          latencyMs,
        },
      });
    } catch (err) {
      logger.warn({ err, skill, venture_id }, "Failed to write agent log");
    }

    logger.info({ skill, venture_id, latencyMs, inputHash }, "Executed skill");

    return {
      success: true,
      skill,
      venture_id,
      output: structuredOutput,
      latency_ms: latencyMs,
    };
  });
};

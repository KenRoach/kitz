import { Worker } from "bullmq";
import { createLogger, getDB } from "@kitz/core";
import { connection } from "./queue.js";

const logger = createLogger("pipeline-worker");
const AGENT_RUNTIME_URL = process.env.AGENT_RUNTIME_URL || "http://agent-runtime:3001";

interface PipelineStep {
  id: string;
  name: string;
  action: string;
  input: Record<string, unknown>;
  dependsOn: string[];
  condition?: string;
  delayMs?: number;
}

interface StepResult {
  stepId: string;
  status: "success" | "failed" | "skipped";
  output: unknown;
}

/** Evaluate a simple condition string against accumulated step results. */
function evaluateCondition(condition: string, results: Map<string, StepResult>): boolean {
  try {
    // Conditions reference prior step outputs, e.g. "steps.extract.status === 'success'"
    const steps = Object.fromEntries(
      [...results.entries()].map(([k, v]) => [k, v]),
    );
    const fn = new Function("steps", `return Boolean(${condition})`);
    return fn(steps);
  } catch (err) {
    logger.warn({ condition, err }, "Condition evaluation failed, treating as false");
    return false;
  }
}

/** Topologically sort steps respecting dependsOn edges. */
function topoSort(steps: PipelineStep[]): PipelineStep[] {
  const byId = new Map(steps.map((s) => [s.id, s]));
  const visited = new Set<string>();
  const sorted: PipelineStep[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const step = byId.get(id);
    if (!step) return;
    for (const dep of step.dependsOn) {
      visit(dep);
    }
    sorted.push(step);
  }

  for (const step of steps) {
    visit(step.id);
  }
  return sorted;
}

/** Execute a single step by calling the agent-runtime service. */
async function executeStep(
  step: PipelineStep,
  pipelineInput: Record<string, unknown>,
  priorResults: Map<string, StepResult>,
): Promise<StepResult> {
  const payload = {
    action: step.action,
    input: {
      ...step.input,
      pipelineInput,
      priorSteps: Object.fromEntries(priorResults),
    },
  };

  const res = await fetch(`${AGENT_RUNTIME_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error({ stepId: step.id, status: res.status, text }, "Step execution failed");
    return { stepId: step.id, status: "failed", output: { error: text } };
  }

  const output = await res.json();
  return { stepId: step.id, status: "success", output };
}

/** Process a pipeline run job. */
async function processPipelineJob(job: { data: { runId: string; pipelineId: string; input: Record<string, unknown> } }) {
  const { runId, pipelineId, input } = job.data;
  const db = getDB();

  logger.info({ runId, pipelineId }, "Starting pipeline run");

  await db.pipelineRun.update({
    where: { id: runId },
    data: { status: "running", startedAt: new Date() },
  });

  try {
    const pipeline = await db.pipeline.findUniqueOrThrow({
      where: { id: pipelineId },
      include: { steps: true },
    });

    const steps: PipelineStep[] = pipeline.steps.map((s: any) => ({
      id: s.id,
      name: s.name,
      action: s.action,
      input: (s.input as Record<string, unknown>) ?? {},
      dependsOn: (s.dependsOn as string[]) ?? [],
      condition: s.condition ?? undefined,
      delayMs: s.delayMs ?? undefined,
    }));

    const sorted = topoSort(steps);
    const results = new Map<string, StepResult>();

    for (const step of sorted) {
      // Check if all dependencies succeeded
      const depsFailed = step.dependsOn.some(
        (depId) => results.get(depId)?.status !== "success",
      );
      if (depsFailed) {
        logger.info({ stepId: step.id }, "Skipping step – dependency not met");
        const result: StepResult = { stepId: step.id, status: "skipped", output: null };
        results.set(step.id, result);
        await db.stepResult.create({ data: { pipelineRunId: runId, stepId: step.id, ...result } });
        continue;
      }

      // Evaluate optional condition
      if (step.condition && !evaluateCondition(step.condition, results)) {
        logger.info({ stepId: step.id, condition: step.condition }, "Skipping step – condition not met");
        const result: StepResult = { stepId: step.id, status: "skipped", output: null };
        results.set(step.id, result);
        await db.stepResult.create({ data: { pipelineRunId: runId, stepId: step.id, ...result } });
        continue;
      }

      // Optional delay
      if (step.delayMs && step.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, step.delayMs));
      }

      const result = await executeStep(step, input, results);
      results.set(step.id, result);
      await db.stepResult.create({
        data: { pipelineRunId: runId, stepId: step.id, ...result, output: result.output as any },
      });

      if (result.status === "failed") {
        logger.error({ stepId: step.id }, "Step failed, aborting pipeline");
        break;
      }
    }

    const hasFailed = [...results.values()].some((r) => r.status === "failed");
    await db.pipelineRun.update({
      where: { id: runId },
      data: {
        status: hasFailed ? "failed" : "completed",
        finishedAt: new Date(),
      },
    });

    logger.info({ runId, status: hasFailed ? "failed" : "completed" }, "Pipeline run finished");
  } catch (err) {
    logger.error({ runId, err }, "Pipeline run crashed");
    await db.pipelineRun.update({
      where: { id: runId },
      data: { status: "failed", finishedAt: new Date() },
    });
    throw err;
  }
}

export function startWorker() {
  const worker = new Worker("pipeline-runs", processPipelineJob, {
    connection,
    concurrency: 5,
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Job failed");
  });

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "Job completed");
  });

  logger.info("Pipeline worker started");
  return worker;
}

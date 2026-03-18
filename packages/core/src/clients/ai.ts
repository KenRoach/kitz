import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "../utils/env.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ai-client");

let client: Anthropic | null = null;

export function getAIClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    });
  }
  return client;
}

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export interface AICompletionOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export async function complete(
  prompt: string,
  options: AICompletionOptions = {},
): Promise<string> {
  const ai = getAIClient();
  const startTime = Date.now();

  const response = await ai.messages.create({
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    system: options.system,
    messages: [{ role: "user", content: prompt }],
  });

  const latencyMs = Date.now() - startTime;
  logger.info({ latencyMs, model: options.model || DEFAULT_MODEL }, "AI completion");

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}

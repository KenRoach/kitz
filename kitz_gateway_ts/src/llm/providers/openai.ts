/** OpenAI LLM provider. */

import OpenAI from "openai";
import type { LlmProvider, LlmRequest, LlmResponse } from "../types.js";

export class OpenAIProvider implements LlmProvider {
  readonly name = "openai";
  private client: OpenAI | null = null;

  init(apiKey: string): void {
    this.client = new OpenAI({ apiKey });
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async call(request: LlmRequest): Promise<LlmResponse> {
    if (!this.client) throw new Error("OpenAI not configured — set OPENAI_API_KEY");

    const messages: OpenAI.ChatCompletionMessageParam[] = request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const tools: OpenAI.ChatCompletionTool[] | undefined = request.tools?.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: { ...t.parameters } as Record<string, unknown>,
      },
    }));

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: request.maxTokens ?? 1024,
      messages,
      ...(tools && tools.length > 0 ? { tools } : {}),
    });

    const choice = response.choices[0];
    const text = choice?.message?.content ?? "";
    const toolCalls: LlmResponse["toolCalls"] = [];

    if (choice?.message?.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        if (tc.type === "function") {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
          } catch {
            args = { _raw: tc.function.arguments };
          }
          toolCalls.push({ name: tc.function.name, args });
        }
      }
    }

    return { text, toolCalls, provider: this.name };
  }
}

/** Claude (Anthropic) LLM provider. */

import Anthropic from "@anthropic-ai/sdk";
import type { LlmProvider, LlmRequest, LlmResponse, LlmMessage } from "../types.js";

export class ClaudeProvider implements LlmProvider {
  readonly name = "claude";
  private client: Anthropic | null = null;

  init(apiKey: string): void {
    this.client = new Anthropic({ apiKey });
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async call(request: LlmRequest): Promise<LlmResponse> {
    if (!this.client) throw new Error("Claude not configured — set ANTHROPIC_API_KEY");

    const systemMsg = request.messages.find((m) => m.role === "system");
    const conversationMsgs = request.messages.filter((m) => m.role !== "system");

    // Build Anthropic tool definitions
    const tools: Anthropic.Tool[] | undefined = request.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool["input_schema"],
    }));

    const messages = conversationMsgs.map((m: LlmMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: request.maxTokens ?? 1024,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages,
      ...(tools && tools.length > 0 ? { tools } : {}),
    });

    let text = "";
    const toolCalls: LlmResponse["toolCalls"] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          name: block.name,
          args: block.input as Record<string, unknown>,
        });
      }
    }

    return { text, toolCalls, provider: this.name };
  }
}

/** KitZ CLI Brain — agentic loop with tool execution. */

import type { LlmMessage, LlmToolDef } from "../llm/types.js";
import type { ToolDef } from "../tools/registry.js";
import { llmCall } from "../llm/router.js";
import { buildSystemPrompt } from "./systemPrompt.js";
import type { CliProfile } from "./systemPrompt.js";

const MAX_TOOL_ITERATIONS = 8;

function toToolDefs(tools: ToolDef[]): LlmToolDef[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters ?? { type: "object", properties: {} },
  }));
}

export interface BrainResult {
  response: string;
  toolsUsed: string[];
}

export class Brain {
  private history: LlmMessage[] = [];
  private systemPrompt: string;
  private toolDefs: LlmToolDef[];
  private toolMap: Map<string, ToolDef>;

  constructor(profile: CliProfile, tools: ToolDef[]) {
    this.systemPrompt = buildSystemPrompt(profile);
    this.toolDefs = toToolDefs(tools);
    this.toolMap = new Map(tools.map((t) => [t.name, t]));
  }

  async send(userMessage: string): Promise<BrainResult> {
    const toolsUsed: string[] = [];
    this.history.push({ role: "user", content: userMessage });

    const messages: LlmMessage[] = [
      { role: "system", content: this.systemPrompt },
      ...this.history,
    ];

    let iterations = 0;
    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const response = await llmCall({
        messages,
        tools: this.toolDefs,
        maxTokens: 2048,
      });

      // No tool calls — return text
      if (response.toolCalls.length === 0) {
        const text = response.text || "No pude generar una respuesta. Intenta de nuevo.";
        this.history.push({ role: "assistant", content: text });
        return { response: text, toolsUsed };
      }

      // Record any pre-tool text
      if (response.text) {
        messages.push({ role: "assistant", content: response.text });
      }

      // Execute tools
      const toolResults: string[] = [];
      for (const tc of response.toolCalls) {
        const tool = this.toolMap.get(tc.name);
        if (!tool) {
          toolResults.push(`[${tc.name}]: herramienta no encontrada`);
          continue;
        }

        toolsUsed.push(tc.name);
        process.stdout.write(`  ⚡ ${tc.name}...`);

        try {
          const result = await tool.handler(tc.args);
          toolResults.push(`[${tc.name}] OK: ${JSON.stringify(result)}`);
          process.stdout.write(" ✓\n");
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toolResults.push(`[${tc.name}] Error: ${msg}`);
          process.stdout.write(` ✗ ${msg}\n`);
        }
      }

      messages.push({
        role: "user",
        content: `Resultados de herramientas:\n${toolResults.join("\n")}\n\nCon base en estos resultados, responde al usuario de forma concisa.`,
      });
    }

    const fallback = "He procesado tu solicitud. ¿Necesitas algo más?";
    this.history.push({ role: "assistant", content: fallback });
    return { response: fallback, toolsUsed };
  }

  clearHistory(): void {
    this.history = [];
  }
}

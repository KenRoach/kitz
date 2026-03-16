/** KitZ Brain — agentic loop: system prompt + context + tool calls. */

import type { ProfileContext } from "../tools/business/types.js";
import type { ToolDef } from "../tools/registry.js";
import type { LlmMessage, LlmToolDef } from "../llm/types.js";
import { getLlmRouter } from "../llm/router.js";
import { buildSystemPrompt } from "./systemPrompt.js";
import { getBusinessContext } from "./context.js";
import { getHistory, storeMessage } from "./memory.js";

const MAX_TOOL_ITERATIONS = 5;

/** Convert ToolDef[] to LLM tool definitions using each tool's own parameter schema. */
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

export async function routeMessage(
  userMessage: string,
  profile: ProfileContext,
  tools: ToolDef[],
): Promise<BrainResult> {
  const router = getLlmRouter();
  const toolsUsed: string[] = [];

  // 1. Build system prompt with context
  const contextSummary = await getBusinessContext(profile.id);
  const systemPrompt = buildSystemPrompt(profile, contextSummary);

  // 2. Load conversation history
  const history = await getHistory(profile.id);

  // 3. Build messages
  const messages: LlmMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  // 4. Store user message
  await storeMessage(profile.id, "user", userMessage);

  // Filter tools to only biz_ tools
  const bizTools = tools.filter((t) => t.name.startsWith("biz_"));
  const toolDefs = toToolDefs(bizTools);

  // Build a map for quick tool lookup
  const toolMap = new Map<string, ToolDef>();
  for (const t of bizTools) toolMap.set(t.name, t);

  // 5. Agentic loop
  let iterations = 0;
  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++;

    const response = await router.route({
      messages,
      tools: toolDefs,
      maxTokens: 1024,
    }, "chat");

    // No tool calls — return the text response
    if (response.toolCalls.length === 0) {
      const text = response.text || "No pude generar una respuesta. Intenta de nuevo.";
      await storeMessage(profile.id, "assistant", text);
      return { response: text, toolsUsed };
    }

    // If the LLM also emitted text before tool calls, record it
    if (response.text) {
      messages.push({ role: "assistant", content: response.text });
    }

    // Execute tool calls and collect results
    const toolResults: string[] = [];
    for (const tc of response.toolCalls) {
      const tool = toolMap.get(tc.name);
      if (!tool) {
        toolResults.push(`[${tc.name}]: herramienta no encontrada`);
        continue;
      }

      toolsUsed.push(tc.name);

      // Inject profile_id into args
      const toolArgs = { ...tc.args, profile_id: profile.id };

      try {
        const result = await tool.handler(toolArgs);
        toolResults.push(`[${tc.name}] OK: ${JSON.stringify(result)}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toolResults.push(`[${tc.name}] Error: ${msg}`);
      }
    }

    // Append tool results as a user message so the LLM knows what happened,
    // then prompt it to synthesize a final response for the user.
    messages.push({
      role: "user",
      content: `Resultados de herramientas:\n${toolResults.join("\n")}\n\nCon base en estos resultados, responde al usuario de forma concisa en español.`,
    });
  }

  // Max iterations reached — return last text
  const fallback = "He procesado tu solicitud. ¿Necesitas algo más?";
  await storeMessage(profile.id, "assistant", fallback);
  return { response: fallback, toolsUsed };
}

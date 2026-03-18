/** LLM abstraction types for multi-provider routing. */

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmToolParams {
  type: string;
  properties: Record<string, { type: string; description?: string; items?: { type: string } }>;
  required?: string[];
}

export interface LlmToolDef {
  name: string;
  description: string;
  parameters: LlmToolParams;
}

export interface LlmToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface LlmRequest {
  messages: LlmMessage[];
  tools?: LlmToolDef[];
  maxTokens?: number;
  temperature?: number;
}

export interface LlmResponse {
  text: string;
  toolCalls: LlmToolCall[];
  provider: string;
}

/** LLM Router — simplified for CLI (Claude-first). */

import type { LlmRequest, LlmResponse } from "./types.js";
import { ClaudeProvider } from "./providers/claude.js";

let _provider: ClaudeProvider | null = null;

export function initLlm(apiKey: string): void {
  const claude = new ClaudeProvider();
  claude.init(apiKey);
  _provider = claude;
}

export function getLlm(): ClaudeProvider {
  if (!_provider) throw new Error("LLM not initialized — call initLlm() first");
  return _provider;
}

export async function llmCall(request: LlmRequest): Promise<LlmResponse> {
  return getLlm().call(request);
}

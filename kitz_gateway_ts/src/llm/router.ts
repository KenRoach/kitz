/** LLM Router — multi-provider routing with fallback chains. */

import type { LlmProvider, LlmRequest, LlmResponse, TaskType } from "./types.js";
import { ClaudeProvider } from "./providers/claude.js";
import { OpenAIProvider } from "./providers/openai.js";
import { GeminiProvider } from "./providers/gemini.js";

const TASK_ROUTING: Record<TaskType, string[]> = {
  chat: ["claude", "openai", "gemini"],
  generation: ["claude", "openai", "gemini"],
  classification: ["gemini", "claude", "openai"],
  extraction: ["gemini", "claude", "openai"],
};

let _instance: LlmRouter | null = null;

export class LlmRouter {
  private providers = new Map<string, LlmProvider>();
  private defaultProvider: string;

  constructor(defaultProvider = "claude") {
    this.defaultProvider = defaultProvider;
  }

  registerProvider(provider: LlmProvider): void {
    this.providers.set(provider.name, provider);
  }

  async route(request: LlmRequest, taskType: TaskType = "chat"): Promise<LlmResponse> {
    const chain = TASK_ROUTING[taskType];
    const errors: string[] = [];

    for (const providerName of chain) {
      const provider = this.providers.get(providerName);
      if (!provider?.isAvailable()) continue;

      try {
        return await provider.call(request);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${providerName}: ${msg}`);
      }
    }

    throw new Error(`All LLM providers failed: ${errors.join("; ")}`);
  }

  async call(request: LlmRequest): Promise<LlmResponse> {
    // Direct call to default provider
    const provider = this.providers.get(this.defaultProvider);
    if (!provider?.isAvailable()) {
      // Fallback to any available provider
      for (const p of this.providers.values()) {
        if (p.isAvailable()) return p.call(request);
      }
      throw new Error("No LLM providers available");
    }
    return provider.call(request);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([, p]) => p.isAvailable())
      .map(([name]) => name);
  }
}

export function initLlmRouter(config: {
  anthropicApiKey: string;
  openaiApiKey: string;
  geminiApiKey: string;
  defaultLlmProvider: string;
}): LlmRouter {
  const router = new LlmRouter(config.defaultLlmProvider);

  const claude = new ClaudeProvider();
  if (config.anthropicApiKey) claude.init(config.anthropicApiKey);
  router.registerProvider(claude);

  const openai = new OpenAIProvider();
  if (config.openaiApiKey) openai.init(config.openaiApiKey);
  router.registerProvider(openai);

  const gemini = new GeminiProvider();
  if (config.geminiApiKey) gemini.init(config.geminiApiKey);
  router.registerProvider(gemini);

  _instance = router;
  return router;
}

export function getLlmRouter(): LlmRouter {
  if (!_instance) throw new Error("LLM Router not initialized — call initLlmRouter() first");
  return _instance;
}

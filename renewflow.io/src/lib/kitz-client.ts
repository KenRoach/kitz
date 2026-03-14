/**
 * KitZ OS API client — for AI features (quote generation, chat).
 * RenewFlow calls KitZ OS for AI intelligence only.
 */

const KITZ_URL = process.env.KITZ_OS_API_URL || "http://localhost:8787";
const KITZ_KEY = process.env.KITZ_API_KEY || "";

interface KitzRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  timeout?: number;
}

async function kitzFetch<T>(path: string, opts: KitzRequestOptions = {}): Promise<T> {
  const { method = "POST", body, timeout = 30000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${KITZ_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": KITZ_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error ?? `KitZ OS request failed: ${res.status}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Real-time REST endpoints ───

export async function generateQuote(assets: Array<{
  id: string;
  brand: string;
  model: string;
  serial: string;
  client: string;
  tier: string;
  daysLeft: number;
  oem: number | null;
  tpm: number;
  deviceType?: string;
}>): Promise<{
  quoteId: string;
  recommendations: Array<{
    assetId: string;
    coverageType: "oem" | "tpm";
    reason: string;
    risk: string;
    price: number;
  }>;
  totalOem: number;
  totalTpm: number;
  savings: number;
  savingsPct: number;
  summary: string;
  clientEmail: { subject: string; body: string };
}> {
  return kitzFetch("/v1/ai/generate_quote", { body: { assets } });
}

export async function aiChat(
  messages: Array<{ role: string; text: string }>,
  message: string,
  context?: unknown,
): Promise<{ response: string }> {
  return kitzFetch("/v1/ai/chat", { body: { messages, message, context } });
}

// ─── Async webhook endpoints ───

export async function requestBatchQuotes(
  batches: Array<{ clientId: string; assetIds: string[] }>,
  callbackUrl: string,
): Promise<{ jobId: string; status: string }> {
  return kitzFetch("/v1/webhooks/batch-quotes", {
    body: { batches, callbackUrl },
  });
}

export async function requestInsightsAnalysis(
  portfolioData: unknown,
  callbackUrl: string,
): Promise<{ jobId: string; status: string }> {
  return kitzFetch("/v1/webhooks/insights", {
    body: { portfolioData, callbackUrl },
  });
}

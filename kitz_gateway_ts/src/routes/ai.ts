/**
 * KitZ OS AI API endpoints — called by RenewFlow for AI intelligence.
 *
 * POST /v1/ai/generate_quote  — Real-time AI quote generation
 * POST /v1/ai/chat            — Real-time AI chat
 */

import type { FastifyInstance } from "fastify";
import { requireApiKey } from "../auth/api-key.js";
import { getClient } from "../tools/quoter.js";

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // ─── Real-time: AI Quote Generation ───
  app.post("/v1/ai/generate_quote", async (request, reply) => {
    requireApiKey(request);

    const { assets } = request.body as {
      assets: Array<{
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
      }>;
    };

    const client = getClient();
    if (!client) {
      return reply.status(503).send({ error: "AI engine not configured" });
    }

    const systemPrompt = `You are a warranty renewal recommendation engine for IT assets in Latin America.
Analyze the asset portfolio and recommend OEM vs TPM coverage for each device.

Decision framework:
- CRITICAL tier → Recommend OEM coverage (highest reliability)
- STANDARD tier with >30% TPM savings → Recommend TPM
- LOW-USE tier → Recommend budget TPM
- EOL devices → TPM only (OEM not available)

Return JSON with: recommendations array, totalOem, totalTpm, savings, savingsPct, summary text, and a client email draft.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate warranty renewal recommendations for this portfolio:\n\n${JSON.stringify(assets, null, 2)}`,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Try to parse as JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return reply.send(parsed);
      }
    } catch {
      // Fall through to text response
    }

    return reply.send({ summary: text, recommendations: [] });
  });

  // ─── Real-time: AI Chat ───
  app.post("/v1/ai/chat", async (request, reply) => {
    requireApiKey(request);

    const { messages, message, context } = request.body as {
      messages: Array<{ role: string; text: string }>;
      message: string;
      context?: unknown;
    };

    const client = getClient();
    if (!client) {
      return reply.status(503).send({ error: "AI engine not configured" });
    }

    const systemPrompt = `You are RenewFlow AI, a warranty renewal assistant for IT resellers in Latin America.
Help users with warranty analysis, quote recommendations, and asset portfolio management.
Be concise (max 200 words). Focus on actionable advice.
${context ? `\nContext: ${JSON.stringify(context)}` : ""}`;

    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: (m.role === "ai" ? "assistant" : m.role) as "user" | "assistant",
        content: m.text,
      }));

    if (message) {
      chatMessages.push({ role: "user", content: message });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: chatMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return reply.send({ response: text });
  });
}

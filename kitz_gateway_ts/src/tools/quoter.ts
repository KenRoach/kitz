/** Kitz OS quote generation — AI orchestration engine for RenewFlow. */

import Anthropic from "@anthropic-ai/sdk";
import type { ToolDef } from "./registry.js";
import { getSupabase } from "../db/client.js";

let _client: Anthropic | null = null;

export function initAnthropic(apiKey: string): void {
  _client = new Anthropic({ apiKey });
}

function getClient(): Anthropic {
  if (!_client) throw new Error("Anthropic API not configured — set ANTHROPIC_API_KEY");
  return _client;
}

interface AssetInput {
  id: string;
  brand: string;
  model: string;
  serial: string;
  client: string;
  tier: string;
  daysLeft: number;
  oem: number | null;
  tpm: number | null;
  deviceType?: string;
}

const SYSTEM_PROMPT = `You are RenewFlow AI — the intelligent warranty renewal assistant for LATAM IT channel partners (VARs).

Your role: Analyze device portfolios and generate intelligent warranty renewal quotes that maximize coverage while minimizing cost.

Decision framework:
- CRITICAL tier devices (workstations, servers, C-level laptops) → recommend OEM coverage for maximum protection
- STANDARD tier devices with >30% TPM savings → recommend TPM coverage
- LOW-USE tier devices → recommend TPM budget option
- EOL devices → TPM only (OEM unavailable)
- Devices expiring within 7 days → flag as URGENT
- Devices already lapsed → flag for recovery sequence

Always provide:
1. Coverage recommendation per device (OEM or TPM) with reasoning
2. Risk assessment (critical/high/medium/low)
3. Total savings analysis
4. A suggested client email (professional, concise, max 200 words)

Respond in valid JSON matching this schema:
{
  "recommendations": [{ "assetId": string, "coverageType": "oem"|"tpm", "reason": string, "risk": "critical"|"high"|"medium"|"low", "price": number }],
  "totalOem": number,
  "totalTpm": number,
  "savings": number,
  "savingsPct": number,
  "summary": string,
  "clientEmail": { "subject": string, "body": string }
}`;

export const quoterTools: ToolDef[] = [
  {
    name: "generate_quote",
    description: "Kitz OS warranty renewal quote generation",
    handler: async (args) => {
      const client = getClient();
      const assets = args.assets as AssetInput[];
      if (!Array.isArray(assets) || assets.length === 0) {
        throw new Error("assets must be a non-empty array");
      }

      const clientName = assets[0].client;
      const userPrompt = `Generate a warranty renewal quote for ${clientName}.

Assets to quote:
${JSON.stringify(assets, null, 2)}

Provide recommendations optimizing for the best balance of cost savings and risk coverage.`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      // Parse JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
      const quoteData = JSON.parse(jsonMatch[1]!.trim());

      // Store quote in database
      const db = getSupabase();
      const quoteId = `Q-${Math.floor(5000 + Math.random() * 5000)}`;
      await db.from("quotes").insert({
        id: quoteId,
        client: clientName,
        assets: assets,
        recommendations: quoteData.recommendations,
        total_oem: quoteData.totalOem,
        total_tpm: quoteData.totalTpm,
        savings: quoteData.savings,
        status: "draft",
      });

      return { quoteId, ...quoteData };
    },
  },
  {
    name: "chat",
    description: "RenewFlow AI chat — warranty renewal assistant for VARs and partners",
    handler: async (args) => {
      const client = getClient();
      const messages = args.messages as { role: string; text: string }[];
      const userMessage = args.message as string;

      if (!userMessage) throw new Error("message is required");

      // Convert chat history to Anthropic format
      const history = (messages ?? []).map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
      }));

      history.push({ role: "user", content: userMessage });

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are RenewFlow AI — the intelligent warranty renewal assistant for LATAM IT channel partners.

You help VARs (Value-Added Resellers) and delivery partners with:
- Warranty renewal strategy and pricing
- TPM vs OEM coverage decisions
- Portfolio risk assessment
- Client communication drafts
- LATAM IT market insights

Communication is email-only. Keep responses under 200 words. Be direct and actionable.`,
        messages: history,
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      return { response: text };
    },
  },
];

/** RenewFlow quote generation — AI orchestration engine. */

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
    description: "RenewFlow warranty renewal quote generation",
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
      if (!text) throw new Error("Empty response from AI — please try again");
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, text];
      let quoteData: Record<string, unknown>;
      try {
        quoteData = JSON.parse(jsonMatch[1]!.trim());
      } catch {
        throw new Error("Failed to parse AI response — please try again");
      }

      // Store quote in database
      const db = getSupabase();
      const quoteId = `Q-${Math.floor(5000 + Math.random() * 5000)}`;
      // NOTE: quote_request column names may differ — verify schema matches these fields
      await db.from("quote_request").insert({
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
    description: "KitZ workspace AI chat — answers questions using the user's workspace data",
    handler: async (args) => {
      const client = getClient();
      const messages = args.messages as { role: string; text: string }[] | undefined;
      const userMessage = args.message as string;
      const orgId = args.org_id as string | undefined;

      if (!userMessage) throw new Error("message is required");

      // Fetch user's workspace data for context
      let dataContext = "";
      if (orgId) {
        try {
          const { getSupabase } = await import("../db/client.js");
          const db = getSupabase();

          // Get assets
          const { data: assets } = await db
            .from("asset_item")
            .select("brand, model, serial, device_type, warranty_end, status")
            .eq("org_id", orgId)
            .limit(50);

          // Get metrics
          const { count: totalDevices } = await db
            .from("asset_item")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId);

          const { count: quotedCount } = await db
            .from("asset_item")
            .select("id", { count: "exact", head: true })
            .eq("org_id", orgId)
            .eq("status", "quoted");

          if (assets && assets.length > 0) {
            dataContext = `\n\nUSER'S WORKSPACE DATA:
- Total devices: ${totalDevices ?? 0}
- Quoted: ${quotedCount ?? 0}
- Device list:\n${assets.map(a => `  • ${a.brand} ${a.model} (${a.device_type}) SN:${a.serial} — warranty ends ${a.warranty_end} [${a.status || "active"}]`).join("\n")}`;
          } else {
            dataContext = "\n\nUSER'S WORKSPACE DATA: No devices imported yet.";
          }
        } catch {
          dataContext = "\n\nUSER'S WORKSPACE DATA: Unable to fetch (temporary error).";
        }
      }

      // Convert chat history to Anthropic format
      const history = (messages ?? []).map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
      }));

      history.push({ role: "user", content: userMessage });

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are Kitz, the AI workspace assistant. You help users manage their business — devices, warranties, quotes, contacts, and deals.

You have access to the user's real workspace data below. Use it to answer questions accurately. If asked about their devices, metrics, or workspace status, reference the actual data.

Keep responses concise (under 200 words). Be warm, direct, and helpful. Respond in the same language the user writes in.${dataContext}`,
        messages: history,
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");

      return { response: text || "I couldn't generate a response. Please try again." };
    },
  },
];

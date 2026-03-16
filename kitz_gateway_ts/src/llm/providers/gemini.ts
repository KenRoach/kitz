/** Gemini (Google) LLM provider. */

import { GoogleGenerativeAI, SchemaType, type FunctionDeclarationsTool } from "@google/generative-ai";
import type { LlmProvider, LlmRequest, LlmResponse } from "../types.js";

export class GeminiProvider implements LlmProvider {
  readonly name = "gemini";
  private genAI: GoogleGenerativeAI | null = null;

  init(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }

  async call(request: LlmRequest): Promise<LlmResponse> {
    if (!this.genAI) throw new Error("Gemini not configured — set GEMINI_API_KEY");

    const systemMsg = request.messages.find((m) => m.role === "system");
    const conversationMsgs = request.messages.filter((m) => m.role !== "system");

    // Build Gemini tools — cast through unknown to satisfy strict Schema types
    let geminiTools: FunctionDeclarationsTool[] | undefined;
    if (request.tools && request.tools.length > 0) {
      geminiTools = [{
        functionDeclarations: request.tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: {
            type: SchemaType.OBJECT,
            properties: (t.parameters.properties ?? {}) as Record<string, never>,
          },
        })),
      }] as unknown as FunctionDeclarationsTool[];
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...(systemMsg ? { systemInstruction: systemMsg.content } : {}),
      ...(geminiTools ? { tools: geminiTools } : {}),
    });

    const history = conversationMsgs.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

    const lastMsg = conversationMsgs[conversationMsgs.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMsg?.content ?? "");

    const response = result.response;
    let text = "";
    try {
      text = response.text?.() ?? "";
    } catch {
      // text() throws if response contains function calls only
    }
    const toolCalls: LlmResponse["toolCalls"] = [];

    // Check for function calls in candidates
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if ("functionCall" in part && part.functionCall) {
          toolCalls.push({
            name: part.functionCall.name,
            args: (part.functionCall.args ?? {}) as Record<string, unknown>,
          });
          text = "";
        }
      }
    }

    return { text, toolCalls, provider: this.name };
  }
}

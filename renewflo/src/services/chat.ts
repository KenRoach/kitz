import type { ChatMessage } from "@/types";

const SYSTEM_PROMPT = `You are RenewFlow AI — intelligent assistant for warranty renewal management in the LATAM IT channel. Help resellers manage installed base, generate TPM+OEM quotes, send alerts. Always present TPM first for Standard/Low-use (30-60% savings). OEM first for Critical. Max 200 words. Use emojis sparingly.`;

export interface ChatService {
  sendMessage(history: ChatMessage[], userText: string): Promise<string>;
}

export function createChatService(): ChatService {
  return {
    async sendMessage(history: ChatMessage[], userText: string): Promise<string> {
      const apiMessages = [...history, { role: "user" as const, text: userText }]
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const text = data.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("\n");

      return text || "Error processing response. Please try again.";
    },
  };
}

import type { ChatMessage } from "@/types";

export interface ChatService {
  sendMessage(history: ChatMessage[], userText: string): Promise<string>;
}

export function createChatService(): ChatService {
  return {
    async sendMessage(history: ChatMessage[], userText: string): Promise<string> {
      const BASE = (import.meta.env.VITE_API_BASE as string) || "/v0.1";
      const token = localStorage.getItem("rf_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const messages = history
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch(`${BASE}/tools/chat/invoke`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          args: { messages, message: userText },
        }),
      });

      const data = await response.json();
      return data.result?.response || "Error processing response. Please try again.";
    },
  };
}

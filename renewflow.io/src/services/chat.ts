import type { ChatContext, ChatMessage } from "@/types";

const TOKEN_KEY = "renewflow_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export interface ChatService {
  sendMessage(history: ChatMessage[], userText: string, context?: ChatContext): Promise<string>;
}

export function createChatService(): ChatService {
  return {
    async sendMessage(
      history: ChatMessage[],
      userText: string,
      context?: ChatContext,
    ): Promise<string> {
      const token = getToken();
      if (!token) {
        return "Please log in to use RenewFlow AI.";
      }

      const chatHistory = history
        .filter((m) => m.role !== "system")
        .slice(-10)
        .map((m) => ({
          role: m.role === "ai" ? "assistant" : m.role,
          content: m.text,
        }));

      // Add current user message
      chatHistory.push({ role: "user", content: userText });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: chatHistory,
            context: context ?? null,
          }),
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          window.dispatchEvent(new CustomEvent("renewflow:auth-expired"));
          return "Session expired. Please log in again.";
        }

        if (!res.ok) {
          return "AI service is temporarily unavailable. Please try again.";
        }

        const data = await res.json();
        return data.content || "Unable to process your request.";
      } catch {
        return "Cannot reach the AI service. Please check your connection.";
      }
    },
  };
}

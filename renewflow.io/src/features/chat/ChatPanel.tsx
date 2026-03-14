"use client";

import { useState, useRef, useEffect, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { useLocale } from "@/i18n";
import type { Locale } from "@/i18n";
import { Icon } from "@/components/icons";
import { createChatService } from "@/services";
import { buildChatContext } from "@/utils";
import type { Asset, AuthUser, ChatMessage, PageId, PurchaseOrder } from "@/types";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  user: AuthUser;
  orders: PurchaseOrder[];
  currentPage: PageId;
  locale: Locale;
}

const chatService = createChatService();

export const ChatPanel: FC<ChatPanelProps> = ({ open, onClose, assets, user, orders, currentPage, locale }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", text: t.aiConnected },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = buildChatContext({ user, assets, orders, currentPage, locale });
      const text = await chatService.sendMessage(messages, userMsg.text, context);
      setMessages((m) => [...m, { role: "ai", text }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: t.connectionError }]);
    } finally {
      setLoading(false);
    }
  };

  // Data-driven quick actions with real counts
  const expiring30 = assets.filter((a) => a.daysLeft >= 0 && a.daysLeft <= 30).length;
  const lapsedCount = assets.filter((a) => a.daysLeft < 0).length;
  const criticalCount = assets.filter((a) => a.tier === "critical").length;

  const quickActions = [
    { label: t.quickExpiring.replace("{count}", String(expiring30)), prompt: t.promptExpiring },
    { label: t.quickCritical.replace("{count}", String(criticalCount)), prompt: t.promptCritical },
    { label: t.quickSummary, prompt: t.promptSummary },
    { label: t.quickLapsed.replace("{count}", String(lapsedCount)), prompt: t.promptLapsed },
  ];

  if (!open) return null;

  return (
    <div
      style={{
        width: 340,
        flexShrink: 0,
        background: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 14, borderBottom: `1px solid ${colors.border}` }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors.accent,
            boxShadow: `0 0 6px ${colors.accentGlow}`,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, flex: 1 }}>RenewFlow AI</span>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            width: 26,
            height: 26,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textMid,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              padding: "8px 12px",
              borderRadius: 10,
              background: m.role === "user" ? colors.accent : m.role === "system" ? `${colors.purple}14` : colors.card,
              color: m.role === "user" ? colors.onAccent : colors.text,
              fontSize: 12,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              border: m.role === "ai" ? `1px solid ${colors.border}` : "none",
              boxShadow: m.role === "ai" ? colors.shadow : "none",
            }}
          >
            {m.role === "system" && (
              <div style={{ fontSize: 9, color: colors.purple, fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>
                System
              </div>
            )}
            {m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "8px 12px", borderRadius: 10, background: colors.card, border: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 12, color: colors.textMid }}>{t.thinking}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && !loading && (
        <div style={{ display: "flex", gap: 4, padding: "0 12px 6px", flexWrap: "wrap" }}>
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => setInput(qa.prompt)}
              style={{
                padding: "3px 8px",
                borderRadius: 12,
                border: `1px solid ${colors.border}`,
                background: "transparent",
                color: colors.textMid,
                fontSize: 10,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 6, padding: "10px 12px", borderTop: `1px solid ${colors.border}` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          aria-label="Chat message"
          placeholder={loading ? t.waitingPlaceholder : t.messagePlaceholder}
          disabled={loading}
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: 8,
            background: colors.inputBg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: 12,
            fontFamily: FONT,
            outline: "none",
            opacity: loading ? 0.5 : 1,
          }}
        />
        <button
          onClick={send}
          aria-label="Send message"
          disabled={loading}
          style={{
            background: loading ? colors.textDim : colors.accent,
            border: "none",
            borderRadius: 8,
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <Icon name="send" size={14} color={colors.onAccent} />
        </button>
      </div>
    </div>
  );
};

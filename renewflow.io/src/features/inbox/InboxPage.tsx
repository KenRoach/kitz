"use client";

import { useState, type FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon, type IconName } from "@/components/icons";
import { Badge, Card, Pill, ComposeModal, EmptyState } from "@/components/ui";
import { INBOX_EMAILS } from "@/data/inbox-seeds";
import { useLocale } from "@/i18n";
import type { InboxEmail, EmailCategory } from "@/types";
import { useRewardsStore } from "@/stores";

// ─── Tab types ───
type InboxTab = "all" | "inbox" | "sent" | "promos" | "starred";

const TAB_CONFIG: { id: InboxTab; label: string; icon: IconName }[] = [
  { id: "all", label: "All", icon: "inbox" },
  { id: "inbox", label: "Received", icon: "email" },
  { id: "sent", label: "Sent", icon: "send" },
  { id: "promos", label: "Promos", icon: "rewards" },
  { id: "starred", label: "Starred", icon: "rewards" },
];

const CATEGORY_LABELS: Record<EmailCategory, string> = {
  quote: "Quote",
  renewal: "Renewal",
  promo: "Promo",
  general: "General",
  reply: "Reply",
};

export const InboxPage: FC = () => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [emails, setEmails] = useState<InboxEmail[]>(INBOX_EMAILS);
  const [tab, setTab] = useState<InboxTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string } | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const addPoints = useRewardsStore((s) => s.addPoints);

  // Filtering
  const filtered = emails.filter((e) => {
    if (tab === "inbox") return e.direction === "inbound";
    if (tab === "sent") return e.direction === "outbound";
    if (tab === "promos") return e.category === "promo";
    if (tab === "starred") return e.starred;
    return true;
  }).filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.subject.toLowerCase().includes(q) ||
      e.fromName.toLowerCase().includes(q) ||
      e.toName.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  });

  const unreadCount = emails.filter((e) => !e.read && e.direction === "inbound").length;
  const selected = selectedId ? emails.find((e) => e.id === selectedId) : null;

  // Get thread emails for the selected email
  const threadEmails = selected?.threadId
    ? emails.filter((e) => e.threadId === selected.threadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : selected
      ? [selected]
      : [];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Mark as read
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, read: true } : e)),
    );
  };

  const handleStar = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
    );
  };

  const handleReply = (email: InboxEmail) => {
    setReplyTo({
      to: email.direction === "inbound" ? email.from : email.to,
      subject: email.subject,
    });
    setShowCompose(true);
  };

  const handleSend = (email: {
    to: string;
    subject: string;
    body: string;
    template: string;
    cc?: string;
  }) => {
    const newEmail: InboxEmail = {
      id: `EM-${Date.now()}`,
      direction: "outbound",
      category: email.template === "promo" ? "promo" : email.template === "renewal" ? "renewal" : email.template === "quote" ? "quote" : "general",
      from: "you@renewflow.io",
      fromName: "You",
      to: email.to,
      toName: email.to.split("@")[0] ?? email.to,
      subject: email.subject,
      body: email.body,
      read: true,
      starred: false,
      timestamp: new Date().toISOString(),
    };
    setEmails((prev) => [newEmail, ...prev]);
    setShowCompose(false);
    setReplyTo(undefined);
    addPoints(`Email sent: ${email.subject}`, 5);
  };

  const handleNewCompose = () => {
    setReplyTo(undefined);
    setShowCompose(true);
  };

  const categoryColor = (cat: EmailCategory) =>
    ({
      quote: colors.accent,
      renewal: colors.warn,
      promo: colors.purple,
      general: colors.blue,
      reply: colors.textMid,
    })[cat];

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: "short" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div style={{ display: "flex", gap: 0, height: "calc(100vh - 48px)", margin: -24, marginTop: -24 }}>
      {/* ─── Left Panel: Email List ─── */}
      <div
        style={{
          width: selected ? 380 : "100%",
          maxWidth: selected ? 380 : undefined,
          borderRight: selected ? `1px solid ${colors.border}` : "none",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 12px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{t.inbox}</h2>
              <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
                {t.inboxSubtitle}
              </p>
            </div>
            <button
              onClick={handleNewCompose}
              style={{
                background: colors.accent,
                color: colors.onAccent,
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 2px 8px ${colors.accent}40`,
              }}
            >
              <Icon name="plus" size={14} color={colors.onAccent} /> {t.compose}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search emails"
              placeholder={t.searchEmails}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 8,
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: 12,
                fontFamily: FONT,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="inbox" size={14} color={colors.textDim} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TAB_CONFIG.map((t) => (
              <Pill key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
                {t.id === "inbox" && unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 4,
                      background: colors.accent,
                      color: colors.onAccent,
                      fontSize: 9,
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "1px 5px",
                      lineHeight: 1.3,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Pill>
            ))}
          </div>
        </div>

        {/* Email list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((e) => (
            <div
              key={e.id}
              role="button"
              tabIndex={0}
              aria-label={`Email: ${e.subject}`}
              onClick={() => handleSelect(e.id)}
              onKeyDown={(ev) => { if (ev.key === "Enter") handleSelect(e.id); }}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 20px",
                borderBottom: `1px solid ${colors.border}`,
                background: selectedId === e.id ? colors.accentDim : !e.read ? `${colors.accent}04` : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: e.direction === "outbound"
                    ? `${colors.accent}14`
                    : `${categoryColor(e.category)}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: e.direction === "outbound" ? colors.accent : categoryColor(e.category) }}>
                  {(e.direction === "outbound" ? e.toName : e.fromName).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: !e.read ? 600 : 500, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.direction === "outbound" ? `To: ${e.toName}` : e.fromName}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: categoryColor(e.category), background: `${categoryColor(e.category)}12`, padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>
                    {CATEGORY_LABELS[e.category]}
                  </span>
                  {e.direction === "outbound" && (
                    <Icon name="send" size={10} color={colors.textDim} />
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: !e.read ? 600 : 400, color: !e.read ? colors.text : colors.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.subject}
                </div>
                <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {e.body.split("\n")[0]}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: colors.textMid }}>{formatDate(e.timestamp)}</span>
                {!e.read && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: colors.accent, boxShadow: `0 0 6px ${colors.accent}55` }} />
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <EmptyState
              icon="inbox"
              title={t.noEmailsTitle}
              description={t.noEmailsDesc}
            />
          )}
        </div>
      </div>

      {/* ─── Right Panel: Email Detail ─── */}
      {selected && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Detail header */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Back to inbox"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, display: "flex", alignItems: "center", marginTop: 2 }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill={colors.textMid}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            </button>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: 0, lineHeight: 1.4 }}>
                {selected.subject}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Badge color={categoryColor(selected.category)}>{CATEGORY_LABELS[selected.category]}</Badge>
                <span style={{ fontSize: 11, color: colors.textMid }}>
                  {selected.direction === "outbound" ? "Sent" : "Received"} &middot;{" "}
                  {new Date(selected.timestamp).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handleStar(selected.id)}
                aria-label={selected.starred ? "Unstar" : "Star"}
                title={selected.starred ? "Unstar" : "Star"}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}
              >
                <Icon name="rewards" size={16} color={selected.starred ? colors.warn : colors.textDim} />
              </button>
              <button
                onClick={() => handleReply(selected)}
                style={{
                  background: colors.accent,
                  color: colors.onAccent,
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="send" size={12} color={colors.onAccent} /> {t.reply}
              </button>
            </div>
          </div>

          {/* Thread view */}
          <div style={{ flex: 1, padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {threadEmails.map((te) => (
              <Card
                key={te.id}
                style={{
                  padding: 20,
                  border: te.id === selected.id ? `1px solid ${colors.accent}30` : `1px solid ${colors.border}`,
                  background: te.direction === "outbound" ? `${colors.accent}04` : colors.card,
                }}
              >
                {/* Email header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: te.direction === "outbound" ? `${colors.accent}14` : `${colors.blue}14`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: te.direction === "outbound" ? colors.accent : colors.blue }}>
                      {te.fromName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                      {te.fromName}
                      {te.direction === "outbound" && (
                        <span style={{ fontWeight: 400, color: colors.textMid }}> → {te.toName}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: colors.textMid, fontFamily: MONO }}>
                      {te.from}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: colors.textMid }}>
                    {new Date(te.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Email body */}
                <div
                  style={{
                    fontSize: 13,
                    color: colors.text,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    paddingLeft: 42,
                  }}
                >
                  {te.body}
                </div>
              </Card>
            ))}
          </div>

          {/* Quick reply bar */}
          <div style={{ padding: "12px 24px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: 8 }}>
            <input
              placeholder="Write a quick reply..."
              onFocus={() => handleReply(selected)}
              readOnly
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: 12,
                fontFamily: FONT,
                outline: "none",
                cursor: "pointer",
              }}
            />
            <button
              onClick={() => handleReply(selected)}
              style={{
                background: colors.accent,
                border: "none",
                borderRadius: 8,
                width: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Icon name="send" size={14} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Compose Modal */}
      <ComposeModal
        open={showCompose}
        onClose={() => { setShowCompose(false); setReplyTo(undefined); }}
        onSend={handleSend}
        replyTo={replyTo}
      />
    </div>
  );
};

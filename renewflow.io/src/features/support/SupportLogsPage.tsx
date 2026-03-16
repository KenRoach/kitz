"use client";

import { useState, useEffect, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, Pill, NewTicketModal, EmptyState } from "@/components/ui";
import { useLocale } from "@/i18n";
import { listTickets } from "@/services/api";
import { SUPPORT_LOGS } from "@/data/seeds";
import type { SupportTicket, TicketStatus, UserRole } from "@/types";

interface SupportLogsPageProps {
  userRole?: UserRole;
}

export const SupportLogsPage: FC<SupportLogsPageProps> = ({ userRole = "var" }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listTickets()
      .then((data) => {
        if (!cancelled) {
          const apiTickets = (data.tickets || []) as SupportTicket[];
          setTickets(apiTickets.length > 0 ? apiTickets : SUPPORT_LOGS);
        }
      })
      .catch(() => { if (!cancelled) setTickets(SUPPORT_LOGS); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: TicketStatus) =>
    ({ open: colors.warn, "in-progress": colors.blue, escalated: colors.danger, resolved: colors.accent }[s] ?? colors.textMid);

  const priorityColor = (p: string) =>
    ({ critical: colors.danger, high: colors.warn, medium: colors.blue, low: colors.textMid }[p] ?? colors.textMid);

  const filtered = filter === "all" ? tickets : tickets.filter((tk) => tk.status === filter);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.textMid, fontSize: 14 }}>
        Loading support tickets...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
            {userRole === "delivery-partner" ? t.serviceTickets : userRole === "support" ? t.supportTickets : t.support}
          </h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            {filtered.length} {filtered.length !== 1 ? t.tickets : t.ticket} &middot; {tickets.filter((tk) => tk.status === "open" || tk.status === "escalated").length} {t.needAttention}
          </p>
        </div>
        {(userRole === "var" || userRole === "support") && (
          <button
            onClick={() => setShowNewTicket(true)}
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
            <Icon name="plus" size={14} color="#fff" /> New Ticket
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "open", "in-progress", "escalated", "resolved"] as const).map((s) => (
          <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Pill>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <EmptyState
            icon="support"
            title={t.noTicketsTitle}
            description={t.noTicketsDesc}
            action={
              (userRole === "var" || userRole === "support")
                ? { label: t.newTicket, onClick: () => setShowNewTicket(true) }
                : undefined
            }
          />
        )}
        {filtered.map((tk) => (
          <Card key={tk.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
            <Icon name="support" size={18} color={statusColor(tk.status)} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{tk.id}</span>
                <Badge color={priorityColor(tk.priority)}>{tk.priority}</Badge>
                <Badge color={statusColor(tk.status)}>{tk.status}</Badge>
              </div>
              <div style={{ fontSize: 13, color: colors.text }}>{tk.issue}</div>
              <div style={{ fontSize: 12, color: colors.textMid, marginTop: 2 }}>
                {tk.client} &middot; {tk.device} &middot; {tk.assignee}
              </div>
            </div>
            <span style={{ fontSize: 12, color: colors.textMid }}>{tk.created}</span>
          </Card>
        ))}
      </div>

      <NewTicketModal
        open={showNewTicket}
        onClose={() => setShowNewTicket(false)}
        onSubmit={() => setShowNewTicket(false)}
      />
    </div>
  );
};

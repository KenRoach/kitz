import { useState, type FC } from "react";
import { useTheme } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, Pill } from "@/components/ui";
import { INBOX_DATA } from "@/data/seeds";
import type { MessageChannel } from "@/types";

export const InboxPage: FC = () => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<"all" | MessageChannel>("all");

  const filtered = filter === "all" ? INBOX_DATA : INBOX_DATA.filter((m) => m.channel === filter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>Inbox</h2>
        <Badge>{INBOX_DATA.filter((m) => m.unread).length} unread</Badge>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Pill active={filter === "all"} onClick={() => setFilter("all")} count={INBOX_DATA.length}>
          All
        </Pill>
        <Pill
          active={filter === "whatsapp"}
          onClick={() => setFilter("whatsapp")}
          count={INBOX_DATA.filter((m) => m.channel === "whatsapp").length}
        >
          WhatsApp
        </Pill>
        <Pill
          active={filter === "email"}
          onClick={() => setFilter("email")}
          count={INBOX_DATA.filter((m) => m.channel === "email").length}
        >
          Email
        </Pill>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map((m) => {
          const channelColor = m.channel === "whatsapp" ? "#25D366" : colors.blue;
          return (
            <Card
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: m.unread ? `${colors.accent}06` : colors.card,
                border: `1px solid ${m.unread ? colors.accent + "25" : colors.border}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: `${channelColor}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={m.channel === "whatsapp" ? "whatsapp" : "email"} size={16} color={channelColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: m.unread ? 600 : 400, color: colors.text }}>
                    {m.from}
                  </span>
                  <span style={{ fontSize: 11, color: colors.textMid }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 12, color: colors.textMid }}>{m.company}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: m.unread ? colors.text : colors.textMid,
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.preview}
                </div>
              </div>
              {m.unread && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors.accent,
                    boxShadow: `0 0 6px ${colors.accent}55`,
                  }}
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

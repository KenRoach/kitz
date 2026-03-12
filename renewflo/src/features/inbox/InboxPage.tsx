import { useState, type FC } from "react";
import { useTheme } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card } from "@/components/ui";
import { INBOX_DATA } from "@/data/seeds";

export const InboxPage: FC = () => {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const unreadCount = INBOX_DATA.filter((m) => m.unread).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>Inbox</h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            Email communications
          </p>
        </div>
        <Badge>{unreadCount} unread</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {INBOX_DATA.map((m) => (
          <Card
            key={m.id}
            onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
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
                background: `${colors.blue}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="email" size={16} color={colors.blue} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: m.unread ? 600 : 400,
                    color: colors.text,
                  }}
                >
                  {m.from}
                </span>
                <span style={{ fontSize: 11, color: colors.textMid }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 12, color: colors.textMid }}>{m.company}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: m.unread ? 500 : 400,
                  color: m.unread ? colors.text : colors.textMid,
                  marginTop: 2,
                }}
              >
                {m.subject}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.textMid,
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
        ))}
      </div>
    </div>
  );
};

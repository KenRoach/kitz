import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon, type IconName } from "@/components/icons";
import { ThemeToggle } from "@/components/ui";
import type { PageId } from "@/types";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  chatOpen: boolean;
  onToggleChat: () => void;
  unreadCount: number;
  alertCount: number;
}

interface NavBtnProps {
  id: PageId;
  icon: IconName;
  label: string;
  active: boolean;
  onClick: () => void;
  badgeCount?: number;
  badgeColor?: string;
}

const NavBtn: FC<NavBtnProps> = ({ icon, label, active, onClick, badgeCount, badgeColor }) => {
  const { colors } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontFamily: FONT,
        width: "100%",
        textAlign: "left",
        background: active ? colors.accentDim : "transparent",
        color: active ? colors.accent : colors.textMid,
        fontSize: 12,
        fontWeight: active ? 600 : 400,
      }}
    >
      <Icon name={icon} size={16} color={active ? colors.accent : colors.textMid} />
      <span style={{ flex: 1 }}>{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          style={{
            background: badgeColor ?? colors.accent,
            color: "#fff",
            borderRadius: 10,
            padding: "1px 6px",
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
};

const NavSection: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const { colors } = useTheme();
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: colors.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "8px 12px 4px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
};

export const Sidebar: FC<SidebarProps> = ({
  activePage,
  onNavigate,
  chatOpen,
  onToggleChat,
  unreadCount,
  alertCount,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <div
      style={{
        width: 200,
        background: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        boxShadow: isDark ? "none" : "1px 0 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "16px 14px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.accent}, #00A88A)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              boxShadow: `0 2px 8px ${colors.accent}40`,
            }}
          >
            RF
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, lineHeight: 1.1 }}>
              RenewFlow
            </div>
            <div
              style={{
                fontSize: 8.5,
                color: colors.textDim,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Warranty Platform
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          flex: 1,
          padding: "8px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <NavSection label="General">
          <NavBtn id="dashboard" icon="dashboard" label="Dashboard" active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
          <NavBtn id="inbox" icon="inbox" label="Inbox" active={activePage === "inbox"} onClick={() => onNavigate("inbox")} badgeCount={unreadCount} />
          <NavBtn id="notifications" icon="bell" label="Alerts" active={activePage === "notifications"} onClick={() => onNavigate("notifications")} badgeCount={alertCount} badgeColor={colors.danger} />
        </NavSection>
        <NavSection label="Sales">
          <NavBtn id="quoter" icon="quote" label="Quoter" active={activePage === "quoter"} onClick={() => onNavigate("quoter")} />
          <NavBtn id="orders" icon="order" label="Purchase Orders" active={activePage === "orders"} onClick={() => onNavigate("orders")} />
          <NavBtn id="import" icon="upload" label="Import Assets" active={activePage === "import"} onClick={() => onNavigate("import")} />
        </NavSection>
        <NavSection label="Operations">
          <NavBtn id="insights" icon="insights" label="Insights" active={activePage === "insights"} onClick={() => onNavigate("insights")} />
          <NavBtn id="support" icon="support" label="Support" active={activePage === "support"} onClick={() => onNavigate("support")} />
          <NavBtn id="rewards" icon="rewards" label="Rewards" active={activePage === "rewards"} onClick={() => onNavigate("rewards")} />
        </NavSection>

        <div style={{ flex: 1 }} />

        <div style={{ marginBottom: 6 }}>
          <ThemeToggle />
        </div>

        <button
          onClick={onToggleChat}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            border: `1px solid ${chatOpen ? colors.accent + "40" : colors.border}`,
            cursor: "pointer",
            fontFamily: FONT,
            width: "100%",
            textAlign: "left",
            background: chatOpen ? colors.accentDim : `${colors.accent}06`,
            color: chatOpen ? colors.accent : colors.textMid,
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          <Icon name="chat" size={16} color={chatOpen ? colors.accent : colors.textMid} />
          <span style={{ flex: 1 }}>AI Chat</span>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: chatOpen ? colors.accent : colors.textDim,
              boxShadow: chatOpen ? `0 0 6px ${colors.accentGlow}` : "none",
            }}
          />
        </button>
      </div>

      {/* User Profile */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.blue})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          U
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: colors.text }}>Partner</div>
          <div style={{ fontSize: 9, color: colors.warn, fontWeight: 500 }}>Gold</div>
        </div>
      </div>
    </div>
  );
};

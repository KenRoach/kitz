"use client";

import { type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon, type IconName } from "@/components/icons";
import { ThemeToggle, LanguageToggle } from "@/components/ui";
import { useLocale } from "@/i18n";
import type { PageId, UserRole } from "@/types";
import { ROLE_LABELS } from "@/types";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  chatOpen: boolean;
  onToggleChat: () => void;
  userName?: string;
  userRole: UserRole;
  onLogout?: () => void;
}

interface NavBtnProps {
  id: PageId;
  icon: IconName;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavBtn: FC<NavBtnProps> = ({ icon, label, active, onClick }) => {
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

// ─── Role color accent for the profile section ───
const ROLE_COLORS: Record<UserRole, [string, string]> = {
  var: ["#2563EB", "#1D4ED8"],           // blue → deep blue
  support: ["#3B82F6", "#6366F1"],       // blue → indigo
  "delivery-partner": ["#1E40AF", "#3730A3"], // navy → indigo
};

const ROLE_TIER: Record<UserRole, string> = {
  var: "Platinum",
  support: "Operations",
  "delivery-partner": "Certified",
};

export const Sidebar: FC<SidebarProps> = ({
  activePage,
  onNavigate,
  chatOpen,
  onToggleChat,
  userName,
  userRole,
  onLogout,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useLocale();

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const [gradA, gradB] = ROLE_COLORS[userRole] || ROLE_COLORS.var;

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
            <path
              d="M4 20c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5"
              stroke="#2563EB"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M4 15c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5"
              stroke="#2563EB"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M4 25c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5"
              stroke="#2563EB"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, letterSpacing: "-0.02em" }}>
            RenewFlow
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
        {/* ─── VAR Navigation ─── */}
        {userRole === "var" && (
          <>
            <NavSection label={t.general}>
              <NavBtn id="dashboard" icon="dashboard" label={t.dashboard} active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
              <NavBtn id="inbox" icon="inbox" label={t.inbox} active={activePage === "inbox"} onClick={() => onNavigate("inbox")} />
              <NavBtn id="notifications" icon="bell" label={t.alerts} active={activePage === "notifications"} onClick={() => onNavigate("notifications")} />
            </NavSection>
            <NavSection label={t.sales}>
              <NavBtn id="quoter" icon="quote" label={t.quoter} active={activePage === "quoter"} onClick={() => onNavigate("quoter")} />
              <NavBtn id="orders" icon="order" label={t.purchaseOrders} active={activePage === "orders"} onClick={() => onNavigate("orders")} />
              <NavBtn id="import" icon="upload" label={t.importAssets} active={activePage === "import"} onClick={() => onNavigate("import")} />
            </NavSection>
            <NavSection label={t.operations}>
              <NavBtn id="support" icon="support" label={t.support} active={activePage === "support"} onClick={() => onNavigate("support")} />
              <NavBtn id="rewards" icon="rewards" label={t.rewards} active={activePage === "rewards"} onClick={() => onNavigate("rewards")} />
              <NavBtn id="pipeline" icon="pipeline" label={t.pipeline} active={activePage === "pipeline"} onClick={() => onNavigate("pipeline")} />
            </NavSection>
          </>
        )}

        {/* ─── Support Team Navigation ─── */}
        {userRole === "support" && (
          <>
            <NavSection label={t.overview}>
              <NavBtn id="dashboard" icon="dashboard" label={t.opsDashboard} active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
              <NavBtn id="notifications" icon="bell" label={t.alerts} active={activePage === "notifications"} onClick={() => onNavigate("notifications")} />
            </NavSection>
            <NavSection label={t.operations}>
              <NavBtn id="support" icon="support" label={t.supportTickets} active={activePage === "support"} onClick={() => onNavigate("support")} />
              <NavBtn id="orders" icon="order" label={t.purchaseOrders} active={activePage === "orders"} onClick={() => onNavigate("orders")} />
              <NavBtn id="inbox" icon="inbox" label={t.messages} active={activePage === "inbox"} onClick={() => onNavigate("inbox")} />
            </NavSection>
            <NavSection label={t.management}>
              <NavBtn id="quoter" icon="quote" label={t.quotesReview} active={activePage === "quoter"} onClick={() => onNavigate("quoter")} />
              <NavBtn id="rewards" icon="rewards" label={t.partnerRewards} active={activePage === "rewards"} onClick={() => onNavigate("rewards")} />
              <NavBtn id="pipeline" icon="pipeline" label={t.pipeline} active={activePage === "pipeline"} onClick={() => onNavigate("pipeline")} />
            </NavSection>
          </>
        )}

        {/* ─── Delivery Partner Navigation ─── */}
        {userRole === "delivery-partner" && (
          <>
            <NavSection label={t.overview}>
              <NavBtn id="dashboard" icon="dashboard" label={t.myDashboard} active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
              <NavBtn id="notifications" icon="bell" label={t.alerts} active={activePage === "notifications"} onClick={() => onNavigate("notifications")} />
            </NavSection>
            <NavSection label={t.fulfillment}>
              <NavBtn id="orders" icon="order" label={t.assignedPOs} active={activePage === "orders"} onClick={() => onNavigate("orders")} />
              <NavBtn id="quoter" icon="quote" label={t.quoteBuilder} active={activePage === "quoter"} onClick={() => onNavigate("quoter")} />
              <NavBtn id="support" icon="support" label={t.serviceTickets} active={activePage === "support"} onClick={() => onNavigate("support")} />
            </NavSection>
            <NavSection label={t.communication}>
              <NavBtn id="inbox" icon="inbox" label={t.messages} active={activePage === "inbox"} onClick={() => onNavigate("inbox")} />
            </NavSection>
            <NavSection label={t.tracking}>
              <NavBtn id="pipeline" icon="pipeline" label={t.pipeline} active={activePage === "pipeline"} onClick={() => onNavigate("pipeline")} />
            </NavSection>
          </>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ marginBottom: 6 }}>
          <NavBtn
            id="settings"
            icon="settings"
            label={t.settings}
            active={activePage === "settings"}
            onClick={() => onNavigate("settings")}
          />
          <NavBtn
            id="how-it-works"
            icon="help"
            label={t.howItWorks}
            active={activePage === "how-it-works"}
            onClick={() => onNavigate("how-it-works")}
          />
          <LanguageToggle />
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
          <span style={{ flex: 1 }}>{t.aiChat}</span>
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
            background: `linear-gradient(135deg, ${gradA}, ${gradB})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: colors.onAccent,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userName || ROLE_LABELS[userRole]}
          </div>
          <div style={{ fontSize: 9, color: colors.warn, fontWeight: 500 }}>
            {ROLE_LABELS[userRole]} &middot; {ROLE_TIER[userRole]}
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            aria-label={t.signOut}
            title={t.signOut}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill={colors.textDim}>
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        )}
      </div>

    </div>
  );
};

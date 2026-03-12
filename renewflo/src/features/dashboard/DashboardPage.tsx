import type { FC } from "react";
import { useTheme } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, MetricCard, SectionHeader, StatusDot } from "@/components/ui";
import { useAssetMetrics } from "@/hooks";
import { urgencyColor, statusLabel } from "@/utils";
import type { Asset, PageId } from "@/types";

interface DashboardPageProps {
  assets: Asset[];
  setPage: (page: PageId) => void;
}

export const DashboardPage: FC<DashboardPageProps> = ({ setPage, assets }) => {
  const { colors } = useTheme();
  const metrics = useAssetMetrics(assets);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: 0 }}>
            Good morning, Partner
          </h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            Portfolio summary &middot; March 2026 &middot; {metrics.totalDevices} devices tracked
          </p>
        </div>
        <button
          onClick={() => setPage("import")}
          style={{
            background: colors.accent,
            color: "#fff",
            border: "none",
            borderRadius: 9,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: `0 2px 8px ${colors.accent}40`,
          }}
        >
          <Icon name="upload" size={16} color="#fff" /> Import Assets
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <MetricCard
          label="Active Devices"
          value={String(metrics.totalDevices)}
          sub={`${metrics.uniqueClients} clients`}
          icon="dashboard"
          color={colors.accent}
          trend={12}
        />
        <MetricCard
          label="Revenue at Risk"
          value={`$${metrics.totalOEM.toLocaleString()}`}
          sub="Next 90 days"
          icon="alert"
          color={colors.warn}
        />
        <MetricCard
          label="TPM Savings"
          value={`$${metrics.savings.toLocaleString()}`}
          sub="vs OEM list price"
          icon="rewards"
          color={colors.accent}
          trend={8}
        />
        <MetricCard label="Renewal Rate" value="87%" sub="+3% vs last month" icon="refresh" color={colors.blue} trend={3} />
      </div>

      {/* Alerts + Pipeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionHeader title="Active Alerts" action="View all" onAction={() => setPage("notifications")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assets
              .filter((a) => a.daysLeft <= 30)
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .slice(0, 5)
              .map((a) => {
                const uc = urgencyColor(colors, a.daysLeft);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: `${uc}08`,
                      border: `1px solid ${uc}18`,
                    }}
                  >
                    <StatusDot color={uc} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
                        {a.brand} {a.model}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMid }}>
                        {a.client} &middot; S/N: {a.serial}
                      </div>
                    </div>
                    <Badge color={uc}>{statusLabel(a.status)}</Badge>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Renewal Pipeline" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { stage: "Quoted", count: metrics.quotedCount, color: colors.blue },
              { stage: "TPM Approved", count: 2, color: colors.accent },
              { stage: "OEM Approved", count: 1, color: colors.purple },
              { stage: "Lapsed (recover)", count: metrics.lapsedCount, color: colors.danger },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: s.color }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>{s.stage}</span>
                  <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: colors.border }}>
                    <div
                      style={{
                        width: `${Math.min((s.count / Math.max(assets.length, 1)) * 100 * 5, 100)}%`,
                        height: "100%",
                        borderRadius: 2,
                        background: s.color,
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: colors.textMid }}>{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <SectionHeader title="Recent Activity" />
        {[
          { text: "Grupo Alfa approved TPM quote — 5 Dell Latitude", time: "2h ago", color: colors.accent },
          { text: "7-day alert sent — Dell Latitude 5540 (DLTG7X3)", time: "4h ago", color: colors.danger },
          { text: "Dual quote generated — Dell Precision 5680", time: "Yesterday", color: colors.blue },
          { text: "TechSoluciones — new contact added", time: "Mar 9", color: colors.purple },
        ].map((a, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < 3 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
            <span style={{ fontSize: 13, color: colors.text, flex: 1 }}>{a.text}</span>
            <span style={{ fontSize: 11, color: colors.textMid }}>{a.time}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

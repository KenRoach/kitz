"use client";

import type { FC } from "react";
import { useTheme, MONO, FONT } from "@/theme";
import { Icon } from "@/components/icons";
import { Badge, Card, MetricCard, SectionHeader, StatusDot } from "@/components/ui";
import { useAssetMetrics } from "@/hooks";
import { urgencyColor, statusLabel } from "@/utils";
import { useLocale } from "@/i18n";
import type { Asset, PageId, UserRole } from "@/types";

interface DashboardPageProps {
  assets: Asset[];
  setPage: (page: PageId) => void;
  userRole: UserRole;
}

// ─── VAR Dashboard ───
const VarDashboard: FC<{ assets: Asset[]; setPage: (page: PageId) => void }> = ({ assets, setPage }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const metrics = useAssetMetrics(assets);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
            {t.goodMorning}
          </h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            {t.portfolioSummary} &middot; March 2026 &middot; {metrics.totalDevices} {t.devicesTracked}
          </p>
        </div>
        <button
          onClick={() => setPage("import")}
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
          <Icon name="upload" size={16} color={colors.onAccent} /> {t.importAssets}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <MetricCard
          label={t.activeDevices}
          value={String(metrics.totalDevices)}
          sub={`${metrics.uniqueClients} ${t.clients}`}
          icon="dashboard"
          color={colors.accent}
          trend={12}
        />
        <MetricCard
          label={t.revenueAtRisk}
          value={`$${metrics.totalOEM.toLocaleString()}`}
          sub={t.next90Days}
          icon="alert"
          color={colors.warn}
        />
        <MetricCard
          label={t.tpmSavings}
          value={`$${metrics.savings.toLocaleString()}`}
          sub={t.vsOemPrice}
          icon="rewards"
          color={colors.accent}
          trend={8}
        />
        <MetricCard label={t.renewalRate} value="87%" sub="+3% vs last month" icon="refresh" color={colors.blue} trend={3} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionHeader title={t.activeAlerts} action={t.viewAll} onAction={() => setPage("notifications")} />
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
          <SectionHeader title={t.renewalPipeline} />
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

      <Card>
        <SectionHeader title={t.recentActivity} />
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
    </>
  );
};

// ─── Support Team Dashboard ───
const SupportDashboard: FC<{ assets: Asset[]; setPage: (page: PageId) => void }> = ({ assets, setPage }) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const metrics = useAssetMetrics(assets);

  const urgentAssets = assets.filter((a) => a.daysLeft <= 14 && a.daysLeft >= 0);
  const lapsedAssets = assets.filter((a) => a.daysLeft < 0);

  return (
    <>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
          {t.opsDashboard}
        </h2>
        <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
          {t.supportOverview} &middot; March 2026
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <MetricCard
          label={t.totalAssets}
          value={String(metrics.totalDevices)}
          sub={`${metrics.uniqueClients} ${t.organizations}`}
          icon="dashboard"
          color={colors.accent}
        />
        <MetricCard
          label={`${t.urgent} (≤14d)`}
          value={String(urgentAssets.length)}
          sub={t.requireAttention}
          icon="alert"
          color={colors.danger}
        />
        <MetricCard
          label={t.lapsed}
          value={String(lapsedAssets.length)}
          sub={t.recoveryQueue}
          icon="support"
          color={colors.warn}
        />
        <MetricCard
          label={t.activeQuotes}
          value={String(metrics.quotedCount)}
          sub={t.pendingApproval}
          icon="quote"
          color={colors.blue}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionHeader title="Escalated Assets" action="View tickets" onAction={() => setPage("support")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...urgentAssets, ...lapsedAssets]
              .sort((a, b) => a.daysLeft - b.daysLeft)
              .slice(0, 6)
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
                        {a.client} &middot; {a.daysLeft < 0 ? "Lapsed" : `${a.daysLeft}d left`}
                      </div>
                    </div>
                    <Badge color={uc}>{a.daysLeft < 0 ? "Lapsed" : `${a.daysLeft}d`}</Badge>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Operations Queue" action="View POs" onAction={() => setPage("orders")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Open tickets", value: 3, color: colors.warn },
              { label: "POs pending approval", value: 2, color: colors.blue },
              { label: "Quotes awaiting review", value: metrics.quotedCount, color: colors.purple },
              { label: "Fulfilled this month", value: 4, color: colors.accent },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: item.color }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: colors.text }}>{item.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: item.color, fontFamily: MONO }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Recent Ops Activity" />
        {[
          { text: "Escalated ticket TK-2024 — HPE ProLiant firmware issue", time: "1h ago", color: colors.danger },
          { text: "PO-1003 approved — NetApp FAS2720 storage renewal", time: "3h ago", color: colors.accent },
          { text: "Quote review completed — Banco del Pacífico fleet", time: "5h ago", color: colors.blue },
          { text: "Partner reward milestone — ServiceNet LATAM hit Gold", time: "Yesterday", color: colors.warn },
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
    </>
  );
};

// ─── Delivery Partner Dashboard ───
const DeliveryDashboard: FC<{ assets: Asset[]; setPage: (page: PageId) => void }> = ({ assets, setPage }) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  const assignedCount = assets.length;
  const urgentCount = assets.filter((a) => a.daysLeft <= 14 && a.daysLeft >= 0).length;

  return (
    <>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>
          {t.myDashboard}
        </h2>
        <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
          {t.deliveryOverview} &middot; March 2026
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        <MetricCard
          label={t.assignedPOs}
          value="3"
          sub={t.awaitingFulfillment}
          icon="order"
          color={colors.accent}
        />
        <MetricCard
          label={t.urgentDevices}
          value={String(urgentCount)}
          sub={t.daysToExpiry}
          icon="alert"
          color={colors.danger}
        />
        <MetricCard
          label={t.devicesInScope}
          value={String(assignedCount)}
          sub={t.acrossAllPOs}
          icon="dashboard"
          color={colors.blue}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <SectionHeader title="Active Assignments" action="View POs" onAction={() => setPage("orders")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Pending acknowledgment", value: 1, color: colors.warn },
              { label: "In fulfillment", value: 2, color: colors.blue },
              { label: "Fulfilled this month", value: 4, color: colors.accent },
              { label: "Service tickets", value: 2, color: colors.purple },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: item.color }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: colors.text }}>{item.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: item.color, fontFamily: MONO }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Recent Updates" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {assets.slice(0, 5).map((a) => {
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
                      {a.client} &middot; {a.daysLeft < 0 ? "Lapsed" : `${a.daysLeft}d`}
                    </div>
                  </div>
                  <Badge color={uc}>{statusLabel(a.status)}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Fulfillment Activity" />
        {[
          { text: "PO-1001 acknowledged — HPE ProLiant DL380 Gen10", time: "2h ago", color: colors.accent },
          { text: "Service ticket opened — Cisco Catalyst 9300 firmware", time: "5h ago", color: colors.warn },
          { text: "PO-1005 fulfilled — Dell EMC PowerEdge R740", time: "Yesterday", color: colors.accent },
          { text: "New PO assigned — Palo Alto PA-5220 renewal", time: "Mar 10", color: colors.blue },
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
    </>
  );
};

// ─── Main Dashboard Export ───
export const DashboardPage: FC<DashboardPageProps> = ({ setPage, assets, userRole }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {userRole === "support" && <SupportDashboard assets={assets} setPage={setPage} />}
      {userRole === "delivery-partner" && <DeliveryDashboard assets={assets} setPage={setPage} />}
      {userRole === "var" && <VarDashboard assets={assets} setPage={setPage} />}
    </div>
  );
};

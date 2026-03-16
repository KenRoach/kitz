"use client";

import { useState, useMemo, type FC } from "react";
import { useTheme, FONT, MONO } from "@/theme";
import { Card, SectionHeader, Badge, StatusDot } from "@/components/ui";
import { Icon } from "@/components/icons";
import { urgencyColor, statusLabel, tierColor } from "@/utils";
import type { Asset, AssetStatus, UserRole } from "@/types";
import { useRewardsStore } from "@/stores";
import { useLocale } from "@/i18n";

interface PipelinePageProps {
  assets: Asset[];
  userRole: UserRole;
}

// ─── Stage definitions ───
interface PipelineStage {
  key: string;
  label: string;
  statuses: AssetStatus[];
  color: string;
  nextStatuses?: AssetStatus[];
}

type SortField = "daysLeft" | "tpm" | "client" | "brand";
type SortDir = "asc" | "desc";

// ─── Detail drawer for a single asset ───
const AssetDrawer: FC<{
  asset: Asset;
  onClose: () => void;
  onAdvance?: (id: string, status: AssetStatus) => void;
  stages: PipelineStage[];
}> = ({ asset, onClose, onAdvance, stages }) => {
  const { colors } = useTheme();
  const uc = urgencyColor(colors, asset.daysLeft);
  const tc = tierColor(colors, asset.tier);
  const currentStage = stages.find((s) => s.statuses.includes(asset.status));
  const nextOpts = currentStage?.nextStatuses || [];

  const row = (label: string, value: string, accent?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` }}>
      <span style={{ fontSize: 11, color: colors.textMid, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: accent || colors.text, fontFamily: MONO }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 380,
        height: "100vh",
        background: colors.card,
        borderLeft: `1px solid ${colors.border}`,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{asset.brand} {asset.model}</div>
          <div style={{ fontSize: 11, color: colors.textMid, marginTop: 2 }}>{asset.serial} &middot; {asset.client}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}>
          <Icon name="close" size={16} color={colors.textDim} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { label: asset.daysLeft < 0 ? `${Math.abs(asset.daysLeft)}d overdue` : `${asset.daysLeft}d remaining`, c: uc },
            { label: asset.tier.toUpperCase(), c: tc },
            { label: statusLabel(asset.status), c: currentStage?.color || colors.textMid },
          ].map((p) => (
            <span key={p.label} style={{
              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
              background: `${p.c}14`, color: p.c, display: "inline-block",
            }}>
              {p.label}
            </span>
          ))}
        </div>
        {row("Serial", asset.serial)}
        {row("Client", asset.client)}
        {row("Device Type", asset.deviceType || "—")}
        {row("Tier", asset.tier)}
        {row("Days Left", asset.daysLeft < 0 ? `${asset.daysLeft}d (lapsed)` : `${asset.daysLeft}d`, uc)}
        {row("TPM Price", `$${asset.tpm.toLocaleString()}`, colors.accent)}
        {row("OEM Price", asset.oem ? `$${asset.oem.toLocaleString()}` : "N/A", asset.oem ? colors.purple : colors.textDim)}
        {asset.oem && row("TPM Savings", `$${(asset.oem - asset.tpm).toLocaleString()} (${Math.round(((asset.oem - asset.tpm) / asset.oem) * 100)}%)`, colors.accent)}
        {row("Status", statusLabel(asset.status))}
        {asset.warrantyEnd && row("Warranty End", asset.warrantyEnd)}
        {asset.purchaseDate && row("Purchase Date", asset.purchaseDate)}
        {asset.quantity && asset.quantity > 1 && row("Quantity", String(asset.quantity))}

        {nextOpts.length > 0 && onAdvance && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.textMid, textTransform: "uppercase", marginBottom: 8 }}>
              Move to stage
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {nextOpts.map((ns) => {
                const targetStage = stages.find((s) => s.statuses.includes(ns));
                return (
                  <button
                    key={ns}
                    onClick={() => { onAdvance(asset.id, ns); onClose(); }}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 8,
                      border: `1px solid ${targetStage?.color || colors.border}`,
                      background: `${targetStage?.color || colors.accent}10`,
                      color: targetStage?.color || colors.accent,
                      cursor: "pointer",
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Icon name="arrow" size={14} color={targetStage?.color || colors.accent} />
                    {statusLabel(ns)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PipelinePage: FC<PipelinePageProps> = ({ assets: initialAssets, userRole }) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  // ─── Local asset state for stage transitions ───
  const [localAssets, setLocalAssets] = useState<Asset[]>(initialAssets);
  // Re-sync when initialAssets changes in length (new import)
  const [prevLen, setPrevLen] = useState(initialAssets.length);
  if (initialAssets.length !== prevLen) {
    setLocalAssets(initialAssets);
    setPrevLen(initialAssets.length);
  }

  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("daysLeft");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const stages: PipelineStage[] = useMemo(() => [
    { key: "discovered", label: "Discovered", statuses: ["discovered"], color: colors.textMid, nextStatuses: ["alerted-90"] },
    { key: "alerted", label: "Alerted", statuses: ["alerted-7", "alerted-14", "alerted-30", "alerted-60", "alerted-90"], color: colors.warn, nextStatuses: ["quoted"] },
    { key: "quoted", label: "Quoted", statuses: ["quoted"], color: colors.blue, nextStatuses: ["tpm-approved", "oem-approved", "lost"] },
    { key: "approved", label: "Approved", statuses: ["tpm-approved", "oem-approved"], color: colors.purple, nextStatuses: ["fulfilled"] },
    { key: "fulfilled", label: "Fulfilled", statuses: ["fulfilled"], color: colors.accent, nextStatuses: [] },
    { key: "lapsed", label: "Lapsed", statuses: ["lapsed"], color: colors.danger, nextStatuses: ["alerted-7", "quoted", "lost"] },
    { key: "lost", label: "Lost", statuses: ["lost"], color: colors.textDim, nextStatuses: ["alerted-7"] },
  ], [colors]);

  const addPoints = useRewardsStore((s) => s.addPoints);

  // ─── Advance asset to new status ───
  const handleAdvance = (assetId: string, newStatus: AssetStatus) => {
    const asset = localAssets.find((a) => a.id === assetId);
    setLocalAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        const daysLeft = newStatus === "fulfilled" ? 365
          : newStatus.startsWith("alerted-") ? parseInt(newStatus.split("-")[1] || "90") : a.daysLeft;
        return { ...a, status: newStatus, daysLeft };
      })
    );
    // Award points based on action
    if (asset) {
      const label = `${asset.brand} ${asset.model} — ${asset.client}`;
      if (newStatus === "fulfilled") {
        addPoints(`Renewal closed: ${label}`, 50);
      } else if (newStatus === "tpm-approved" || newStatus === "oem-approved") {
        addPoints(`Quote approved: ${label}`, 35);
      } else if (newStatus === "quoted") {
        addPoints(`Asset quoted: ${label}`, 25);
      } else {
        addPoints(`Pipeline advanced: ${label}`, 10);
      }
    }
  };

  // ─── Stage data ───
  const stageData = useMemo(() => stages.map((s) => {
    const stageAssets = localAssets.filter((a) => s.statuses.includes(a.status));
    const count = stageAssets.length;
    const value = stageAssets.reduce((sum, a) => sum + a.tpm, 0);
    const oemValue = stageAssets.reduce((sum, a) => sum + (a.oem ?? 0), 0);
    return { ...s, assets: stageAssets, count, value, oemValue };
  }), [localAssets, stages]);

  const totalDevices = localAssets.length;
  const activeStages = stageData.filter((s) => !["fulfilled", "lost"].includes(s.key));
  const activeValue = activeStages.reduce((s, d) => s + d.value, 0);
  const activeCount = activeStages.reduce((s, d) => s + d.count, 0);
  const fulfilledCount = stageData.find((s) => s.key === "fulfilled")?.count ?? 0;
  const lapsedCount = stageData.find((s) => s.key === "lapsed")?.count ?? 0;

  // ─── Unique clients ───
  const clients = useMemo(() => {
    const set = new Set(localAssets.map((a) => a.client));
    return Array.from(set).sort();
  }, [localAssets]);

  // ─── Filtered assets ───
  const filteredAssets = useMemo(() => {
    const stage = selectedStage ? stageData.find((s) => s.key === selectedStage) : null;
    let list = stage ? stage.assets : localAssets;
    if (clientFilter !== "all") list = list.filter((a) => a.client === clientFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.brand.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.serial.toLowerCase().includes(q) ||
        a.client.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "daysLeft": cmp = a.daysLeft - b.daysLeft; break;
        case "tpm": cmp = a.tpm - b.tpm; break;
        case "client": cmp = a.client.localeCompare(b.client); break;
        case "brand": cmp = `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [selectedStage, stageData, localAssets, clientFilter, search, sortField, sortDir]);

  const heading = userRole === "delivery-partner" ? t.fulfillmentPipeline : t.pipeline;
  const subheading = userRole === "delivery-partner"
    ? t.manageFulfillment
    : t.manageRenewals;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };
  const sortArrow = (field: SortField) => sortField === field ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";

  const selectStyle: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 12,
    fontFamily: FONT,
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{heading}</h2>
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>{subheading}</p>
        </div>
        <button
          onClick={() => setLocalAssets(initialAssets)}
          title="Reset pipeline"
          style={{
            padding: "7px 14px", borderRadius: 8, border: `1px solid ${colors.border}`,
            background: colors.card, color: colors.textMid, cursor: "pointer",
            fontFamily: FONT, fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Icon name="refresh" size={13} color={colors.textMid} />
          {t.reset}
        </button>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: t.totalDevicesLabel, value: String(totalDevices), color: colors.text },
          { label: t.activePipeline, value: `$${activeValue.toLocaleString()}`, color: colors.blue },
          { label: t.inProgress, value: String(activeCount), color: colors.warn },
          { label: t.fulfilled, value: String(fulfilledCount), color: colors.accent },
          { label: t.lapsed, value: String(lapsedCount), color: colors.danger },
        ].map((m, i) => (
          <Card key={i} style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 10, color: colors.textMid, textTransform: "uppercase", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: MONO }}>{m.value}</div>
          </Card>
        ))}
      </div>

      {/* Stage selector pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => setSelectedStage(null)}
          style={{
            padding: "6px 14px", borderRadius: 20,
            border: `1px solid ${!selectedStage ? colors.accent : colors.border}`,
            background: !selectedStage ? colors.accentDim : "transparent",
            color: !selectedStage ? colors.accent : colors.textMid,
            cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600,
          }}
        >
          All ({totalDevices})
        </button>
        {stageData.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedStage(s.key === selectedStage ? null : s.key)}
            style={{
              padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${selectedStage === s.key ? s.color : colors.border}`,
              background: selectedStage === s.key ? `${s.color}14` : "transparent",
              color: selectedStage === s.key ? s.color : colors.textMid,
              cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
            {s.label}
            <span style={{ fontFamily: MONO, fontWeight: 700 }}>{s.count}</span>
          </button>
        ))}
      </div>

      {/* Funnel bar */}
      <Card style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: colors.border }}>
          {stageData.filter((s) => s.count > 0).map((s) => {
            const pct = totalDevices > 0 ? (s.count / totalDevices) * 100 : 0;
            return (
              <div
                key={s.key}
                role="button"
                tabIndex={0}
                aria-label={`${s.label}: ${s.count} devices`}
                title={`${s.label}: ${s.count} devices — $${s.value.toLocaleString()}`}
                style={{
                  width: `${pct}%`, minWidth: pct > 0 ? 4 : 0, background: s.color,
                  cursor: "pointer", transition: "width 0.4s ease, opacity 0.2s",
                  opacity: selectedStage && selectedStage !== s.key ? 0.35 : 1,
                }}
                onClick={() => setSelectedStage(s.key === selectedStage ? null : s.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedStage(s.key === selectedStage ? null : s.key); }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {stageData.map((s) => (
            <div key={s.key} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 9, color: colors.textDim, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: MONO }}>{s.count}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search devices"
          placeholder={t.searchDevices}
          style={{
            flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8,
            border: `1px solid ${colors.border}`, background: colors.inputBg,
            color: colors.text, fontSize: 12, fontFamily: FONT, outline: "none", boxSizing: "border-box",
          }}
        />
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} style={selectStyle}>
          <option value="all">{t.allClients}</option>
          {clients.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Asset table */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: FONT }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                {[
                  { field: "brand" as SortField, label: "Device" },
                  { field: "client" as SortField, label: "Client" },
                  { field: null, label: "Status" },
                  { field: null, label: "Tier" },
                  { field: "daysLeft" as SortField, label: "Days Left" },
                  { field: "tpm" as SortField, label: "TPM Value" },
                  { field: null, label: "Actions" },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={col.field ? () => toggleSort(col.field!) : undefined}
                    style={{
                      padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 600,
                      color: colors.textMid, textTransform: "uppercase", letterSpacing: "0.04em",
                      cursor: col.field ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}{col.field ? sortArrow(col.field) : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: colors.textDim }}>{t.noDevicesFound}</td>
                </tr>
              )}
              {filteredAssets.map((a) => {
                const uc = urgencyColor(colors, a.daysLeft);
                const tc = tierColor(colors, a.tier);
                const currentStage = stages.find((s) => s.statuses.includes(a.status));
                const nextOpts = currentStage?.nextStatuses || [];
                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAsset(a)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`, cursor: "pointer",
                      background: selectedAsset?.id === a.id ? `${colors.accent}08` : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.cardHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedAsset?.id === a.id ? `${colors.accent}08` : "transparent"; }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, color: colors.text }}>{a.brand} {a.model}</div>
                      <div style={{ fontSize: 10, color: colors.textDim, fontFamily: MONO }}>{a.serial}</div>
                    </td>
                    <td style={{ padding: "10px 12px", color: colors.text }}>{a.client}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <StatusDot color={currentStage?.color || colors.textMid} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: currentStage?.color || colors.textMid }}>{statusLabel(a.status)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}><Badge color={tc}>{a.tier}</Badge></td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontFamily: MONO, fontWeight: 700, color: uc }}>{a.daysLeft}d</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontFamily: MONO, fontWeight: 600, color: colors.accent }}>${a.tpm.toLocaleString()}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
                      {nextOpts.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => { if (e.target.value) handleAdvance(a.id, e.target.value as AssetStatus); }}
                          style={{ ...selectStyle, padding: "5px 8px", fontSize: 11, minWidth: 100 }}
                        >
                          <option value="">Move to...</option>
                          {nextOpts.map((ns) => <option key={ns} value={ns}>{statusLabel(ns)}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client breakdown */}
      <Card>
        <SectionHeader title={t.pipelineByClient} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(() => {
            const clientMap: Record<string, { count: number; value: number; stages: Record<string, number> }> = {};
            for (const a of localAssets) {
              if (!clientMap[a.client]) clientMap[a.client] = { count: 0, value: 0, stages: {} };
              const entry = clientMap[a.client]!;
              entry.count++;
              entry.value += a.tpm;
              const stageName = stages.find((s) => s.statuses.includes(a.status))?.key || "other";
              entry.stages[stageName] = (entry.stages[stageName] || 0) + 1;
            }
            return Object.entries(clientMap)
              .sort(([, a], [, b]) => b.value - a.value)
              .map(([client, data]) => (
                <div
                  key={client}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter by ${client}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8,
                    background: clientFilter === client ? `${colors.accent}08` : "transparent",
                    border: `1px solid ${clientFilter === client ? colors.accent + "20" : colors.border}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onClick={() => setClientFilter(clientFilter === client ? "all" : client)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setClientFilter(clientFilter === client ? "all" : client); }}
                >
                  <Badge color={colors.accent}>{data.count}</Badge>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{client}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      {Object.entries(data.stages).map(([stageKey, cnt]) => {
                        const s = stageData.find((sd) => sd.key === stageKey);
                        return (
                          <span key={stageKey} style={{
                            fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                            background: `${s?.color || colors.textMid}14`, color: s?.color || colors.textMid,
                          }}>
                            {s?.label || stageKey} {cnt}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: colors.accent, fontFamily: MONO }}>
                    ${data.value.toLocaleString()}
                  </span>
                </div>
              ));
          })()}
        </div>
      </Card>

      {/* Asset detail drawer */}
      {selectedAsset && (
        <>
          <div
            role="button"
            tabIndex={-1}
            aria-label="Close detail panel"
            onClick={() => setSelectedAsset(null)}
            onKeyDown={(e) => { if (e.key === "Escape") setSelectedAsset(null); }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 999 }}
          />
          <AssetDrawer
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onAdvance={handleAdvance}
            stages={stages}
          />
        </>
      )}
    </div>
  );
};

import { useEffect, useState, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Card, SectionHeader } from "@/components/ui";
import { generateInsights, type InsightsData } from "@/services/gateway";

const HEATMAP_LABELS: Record<string, { label: string; color: string }> = {
  critical_7d: { label: "Critical (≤7d)", color: "#FF4757" },
  urgent_14d: { label: "Urgent (≤14d)", color: "#FF6B81" },
  warning_30d: { label: "Warning (≤30d)", color: "#FFA502" },
  attention_60d: { label: "Attention (≤60d)", color: "#3742FA" },
  healthy_90d: { label: "Healthy (>60d)", color: "#2ED573" },
  lapsed: { label: "Lapsed", color: "#747D8C" },
};

const TIER_COLORS: Record<string, string> = {
  critical: "#FF4757",
  standard: "#3742FA",
  "low-use": "#FFA502",
  eol: "#747D8C",
};

export const InsightsPage: FC = () => {
  const { colors } = useTheme();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, color: colors.textMid, fontFamily: FONT }}>
        Loading insights...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24, color: colors.danger, fontFamily: FONT }}>
        Failed to load insights. Is the Kitz Gateway running?
      </div>
    );
  }

  const maxConcentration = Math.max(...data.clientConcentration.map((c) => c.count));
  const maxBrandSavings = Math.max(...data.brandSavings.map((b) => b.savings), 1);
  const totalHeatmap = Object.values(data.expiryHeatmap).reduce((s, n) => s + n, 0);

  return (
    <div style={{ fontFamily: FONT }}>
      <SectionHeader title="Portfolio Insights" />

      {/* Top KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Devices" value={data.totalDevices} color={colors.accent} bg={colors} />
        <KpiCard label="At-Risk Devices" value={data.atRiskDevices} color="#FF4757" bg={colors} />
        <KpiCard
          label="Revenue at Risk"
          value={`$${data.revenueAtRisk.toLocaleString()}`}
          color="#FFA502"
          bg={colors}
        />
        <KpiCard
          label="Potential Savings"
          value={`$${data.brandSavings.reduce((s, b) => s + b.savings, 0).toLocaleString()}`}
          color={colors.accent}
          bg={colors}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Client Concentration */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
            Client Concentration
          </div>
          {data.clientConcentration.map((c) => (
            <div key={c.client} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: colors.text, fontWeight: 500 }}>{c.client}</span>
                <span style={{ color: colors.textDim }}>{c.count} devices ({c.pct}%)</span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: colors.border,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(c.count / maxConcentration) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: c.pct > 30 ? "#FF4757" : colors.accent,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </Card>

        {/* Warranty Expiry Heatmap */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
            Warranty Expiry Timeline
          </div>
          {Object.entries(data.expiryHeatmap).map(([key, count]) => {
            const meta = HEATMAP_LABELS[key];
            if (!meta) return null;
            const pct = totalHeatmap > 0 ? (count / totalHeatmap) * 100 : 0;
            return (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: colors.text, fontWeight: 500 }}>{meta.label}</span>
                  <span style={{ color: colors.textDim }}>
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: colors.border, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: meta.color,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Brand Savings Comparison */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
            TPM vs OEM Savings by Brand
          </div>
          {data.brandSavings.map((b) => (
            <div key={b.brand} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: colors.text, fontWeight: 500 }}>
                  {b.brand} ({b.count} devices)
                </span>
                <span style={{ color: colors.accent, fontWeight: 600 }}>
                  ${b.savings} saved ({b.savingsPct}%)
                </span>
              </div>
              {/* Stacked bar: TPM (green) + savings gap */}
              <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(b.tpm / (b.oem || 1)) * 100}%`,
                    background: colors.accent,
                    borderRadius: "4px 0 0 4px",
                  }}
                />
                <div
                  style={{
                    width: `${(b.savings / maxBrandSavings) * 40}%`,
                    background: `${colors.accent}40`,
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: colors.textDim }}>
                <span>TPM: ${b.tpm}</span>
                <span>OEM: ${b.oem}</span>
              </div>
            </div>
          ))}
        </Card>

        {/* Tier Distribution */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 16 }}>
            Tier Distribution
          </div>
          {/* CSS pie-chart via conic-gradient */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                flexShrink: 0,
                background: buildConicGradient(data.tierDistribution),
              }}
            />
            <div>
              {data.tierDistribution.map((t) => (
                <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: TIER_COLORS[t.tier] ?? colors.textDim,
                    }}
                  />
                  <span style={{ fontSize: 11, color: colors.text, fontWeight: 500, textTransform: "capitalize" }}>
                    {t.tier}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textDim }}>
                    {t.count} ({t.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Helpers ──

function buildConicGradient(tiers: { tier: string; pct: number }[]): string {
  let acc = 0;
  const stops: string[] = [];
  for (const t of tiers) {
    const color = TIER_COLORS[t.tier] ?? "#747D8C";
    stops.push(`${color} ${acc}% ${acc + t.pct}%`);
    acc += t.pct;
  }
  return `conic-gradient(${stops.join(", ")})`;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  color: string;
  bg: { card: string; border: string; text: string; textDim: string };
}

const KpiCard: FC<KpiCardProps> = ({ label, value, color, bg }) => (
  <div
    style={{
      background: bg.card,
      border: `1px solid ${bg.border}`,
      borderRadius: 12,
      padding: "16px 20px",
      borderLeft: `3px solid ${color}`,
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: FONT }}>{value}</div>
    <div style={{ fontSize: 11, color: bg.textDim, marginTop: 4 }}>{label}</div>
  </div>
);

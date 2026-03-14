"use client";

import { useEffect, type FC } from "react";
import { useTheme, MONO } from "@/theme";
import { Icon } from "@/components/icons";
import { Card, SectionHeader } from "@/components/ui";
import { useRewardsStore } from "@/stores";
import { useLocale } from "@/i18n";

export const RewardsPage: FC = () => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const r = useRewardsStore((s) => s.profile);
  const hydrate = useRewardsStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  const progress = r.nextAt > 0 ? Math.min((r.points / r.nextAt) * 100, 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>My Rewards</h2>
        <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>{t.rewardsSubtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Card style={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.accent}10)`, border: `1px solid ${colors.accent}25` }}>
          <div style={{ fontSize: 12, color: colors.textMid, textTransform: "uppercase", marginBottom: 8 }}>{t.yourPoints}</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: colors.accent, fontFamily: MONO, lineHeight: 1 }}>
            {r.points.toLocaleString()}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: colors.textMid, marginBottom: 6 }}>
              <span>
                Level: <span style={{ color: colors.warn, fontWeight: 600 }}>{r.level}</span>
              </span>
              <span>
                Next: <span style={{ color: colors.accent }}>{r.nextLevel}</span> ({r.nextAt.toLocaleString()})
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: colors.border }}>
              <div style={{ width: `${progress}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${colors.warn}, ${colors.accent})`, transition: "width 0.5s ease" }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, color: colors.textMid, textTransform: "uppercase", marginBottom: 12 }}>{t.howToEarn}</div>
          {[
            { a: "Close a renewal", p: "50 pts/device", i: "check" as const },
            { a: "Advance pipeline stage", p: "25 pts", i: "pipeline" as const },
            { a: "Send a quote", p: "25 pts", i: "quote" as const },
            { a: "Create a PO", p: "50 pts", i: "order" as const },
            { a: "Import assets", p: "10 pts/batch", i: "upload" as const },
            { a: "Refer a reseller", p: "500 pts", i: "rewards" as const },
          ].map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Icon name={h.i} size={14} color={colors.accent} />
              <span style={{ flex: 1, fontSize: 12, color: colors.text }}>{h.a}</span>
              <span style={{ fontSize: 11, fontFamily: MONO, color: colors.accent, fontWeight: 600 }}>{h.p}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent activity — live feed */}
      <Card>
        <SectionHeader title={t.pointsHistory} />
        {r.history.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: colors.textMid }}>
            {t.noPointsYet}
          </div>
        )}
        {r.history.map((h, i) => (
          <div
            key={`${h.date}-${h.action}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: i < r.history.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: colors.text }}>{h.action}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: MONO }}>+{h.pts}</span>
            <span style={{ fontSize: 11, color: colors.textMid, minWidth: 50, textAlign: "right" }}>{h.date}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

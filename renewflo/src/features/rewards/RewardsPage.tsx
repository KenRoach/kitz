import { useEffect, useState, type FC } from "react";
import { useTheme, MONO } from "@/theme";
import { Icon } from "@/components/icons";
import { Card, SectionHeader } from "@/components/ui";
import { REWARDS_DATA } from "@/data/seeds";
import { getRewards } from "@/services/gateway";
import type { RewardsProfile } from "@/types";

export const RewardsPage: FC = () => {
  const { colors } = useTheme();
  const [r, setR] = useState<RewardsProfile>(REWARDS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRewards()
      .then(setR)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load rewards"))
      .finally(() => setLoading(false));
  }, []);

  const progress = (r.points / r.nextAt) * 100;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: colors.textMid }}>Loading rewards...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: colors.danger ?? "#FF4757" }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>Rewards Program</h2>
        <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>Earn points for usage, referrals, and sales</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Card style={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.accent}10)`, border: `1px solid ${colors.accent}25` }}>
          <div style={{ fontSize: 12, color: colors.textMid, textTransform: "uppercase", marginBottom: 8 }}>Your Points</div>
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
              <div style={{ width: `${progress}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${colors.warn}, ${colors.accent})` }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 12, color: colors.textMid, textTransform: "uppercase", marginBottom: 12 }}>How to Earn</div>
          {[
            { a: "Close a renewal", p: "50 pts/device", i: "check" as const },
            { a: "Refer a reseller", p: "500 pts", i: "rewards" as const },
            { a: "Send a quote", p: "25 pts", i: "quote" as const },
            { a: "7-day streak", p: "100 pts", i: "refresh" as const },
          ].map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Icon name={h.i} size={14} color={colors.accent} />
              <span style={{ flex: 1, fontSize: 12, color: colors.text }}>{h.a}</span>
              <span style={{ fontSize: 11, fontFamily: MONO, color: colors.accent, fontWeight: 600 }}>{h.p}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <SectionHeader title="Points History" />
        {r.history.map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: i < r.history.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent }} />
            <span style={{ flex: 1, fontSize: 13, color: colors.text }}>{h.action}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: MONO }}>+{h.pts}</span>
            <span style={{ fontSize: 11, color: colors.textMid, minWidth: 50, textAlign: "right" }}>{h.date}</span>
          </div>
        ))}
      </Card>
    </div>
  );
};

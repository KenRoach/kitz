import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon, type IconName } from "@/components/icons";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: IconName;
  color?: string;
  trend?: number;
}

export const MetricCard: FC<MetricCardProps> = ({ label, value, sub, icon, color, trend }) => {
  const { colors } = useTheme();
  const c = color ?? colors.accent;

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            color: colors.textMid,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `${c}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={16} color={c} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: colors.text,
            fontFamily: FONT,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {trend !== undefined && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: trend > 0 ? colors.accent : colors.danger,
            }}
          >
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span style={{ fontSize: 12, color: colors.textMid }}>{sub}</span>}
    </Card>
  );
};

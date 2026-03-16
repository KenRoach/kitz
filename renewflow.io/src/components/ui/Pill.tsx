"use client";

import type { FC, ReactNode } from "react";
import { useTheme, FONT } from "@/theme";

interface PillProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  count?: number;
}

export const Pill: FC<PillProps> = ({ active, children, onClick, count }) => {
  const { colors } = useTheme();

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        border: `1px solid ${active ? colors.accent : colors.border}`,
        background: active ? colors.accentDim : "transparent",
        color: active ? colors.accent : colors.textMid,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {children}
      {count !== undefined && (
        <span
          style={{
            background: active ? colors.accent : colors.textDim,
            color: colors.onAccent,
            borderRadius: 10,
            padding: "1px 6px",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

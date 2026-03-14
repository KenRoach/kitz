"use client";

import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";

export const ThemeToggle: FC = () => {
  const { isDark, toggle, colors } = useTheme();

  return (
    <button
      onClick={toggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        background: colors.inputBg,
        cursor: "pointer",
        fontFamily: FONT,
        color: colors.textMid,
        fontSize: 11,
        fontWeight: 500,
        width: "100%",
      }}
    >
      <Icon name={isDark ? "sun" : "moon"} size={14} color={colors.textMid} />
      <span style={{ flex: 1, textAlign: "left" }}>{isDark ? "Light mode" : "Dark mode"}</span>
      <div
        style={{
          width: 32,
          height: 18,
          borderRadius: 9,
          padding: 2,
          background: isDark ? colors.accent : colors.border,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: isDark ? colors.bg : "#fff",
            transform: isDark ? "translateX(14px)" : "translateX(0)",
            transition: "transform 0.25s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
    </button>
  );
};

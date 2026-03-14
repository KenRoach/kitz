"use client";

import type { FC, ReactNode } from "react";
import { useTheme, MONO } from "@/theme";

interface BadgeProps {
  children: ReactNode;
  color?: string;
}

export const Badge: FC<BadgeProps> = ({ children, color }) => {
  const { colors } = useTheme();
  const c = color ?? colors.accent;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: MONO,
        color: c,
        background: `${c}14`,
      }}
    >
      {children}
    </span>
  );
};

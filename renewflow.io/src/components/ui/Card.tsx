"use client";

import type { CSSProperties, FC, ReactNode } from "react";
import { useTheme } from "@/theme";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}

export const Card: FC<CardProps> = ({ children, style, onClick }) => {
  const { colors } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: colors.shadow,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

"use client";

import type { FC, ReactNode } from "react";
import { useTheme, FONT } from "@/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: 0,
            fontFamily: FONT,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

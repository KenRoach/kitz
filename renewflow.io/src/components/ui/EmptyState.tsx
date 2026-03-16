"use client";

import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon, type IconName } from "@/components/icons";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: `${colors.accent}10`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={24} color={colors.accent} />
      </div>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: colors.text,
          margin: "0 0 6px",
          fontFamily: FONT,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: colors.textMid,
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: colors.accent,
            color: colors.onAccent,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

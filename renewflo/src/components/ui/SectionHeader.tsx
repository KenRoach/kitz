import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export const SectionHeader: FC<SectionHeaderProps> = ({ title, action, onAction }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: 0 }}>{title}</h3>
      {action && (
        <button
          onClick={onAction}
          style={{
            background: "none",
            border: "none",
            color: colors.accent,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {action} <Icon name="arrow" size={14} color={colors.accent} />
        </button>
      )}
    </div>
  );
};

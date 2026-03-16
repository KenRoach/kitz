"use client";

import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { useLocale, LOCALE_LABELS, type Locale } from "@/i18n";

const LOCALES: Locale[] = ["en", "es", "pt"];

export const LanguageToggle: FC = () => {
  const { colors } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 8,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        width: "100%",
        marginBottom: 4,
      }}
    >
      {LOCALES.map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          style={{
            flex: 1,
            padding: "6px 0",
            fontSize: 10,
            fontWeight: locale === loc ? 700 : 500,
            fontFamily: FONT,
            border: "none",
            cursor: "pointer",
            background: locale === loc ? colors.accent : colors.inputBg,
            color: locale === loc ? "#fff" : colors.textMid,
            transition: "all 0.15s ease",
          }}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
};

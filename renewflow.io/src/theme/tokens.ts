// ─── Design Tokens ───

export interface ColorTokens {
  bg: string;
  sidebar: string;
  card: string;
  cardHover: string;
  border: string;
  accent: string;
  accentDim: string;
  accentGlow: string;
  onAccent: string;
  success: string;
  successDim: string;
  warn: string;
  warnDim: string;
  danger: string;
  dangerDim: string;
  blue: string;
  blueDim: string;
  purple: string;
  purpleDim: string;
  text: string;
  textMid: string;
  textDim: string;
  shadow: string;
  shadowLg: string;
  inputBg: string;
}

export const LIGHT: ColorTokens = {
  bg: "#F8F9FC",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F1F3F9",
  border: "#E3E8F0",
  accent: "#2563EB",
  accentDim: "#2563EB10",
  accentGlow: "#2563EB40",
  onAccent: "#FFFFFF",
  success: "#16a34a",
  successDim: "#16a34a14",
  warn: "#E8890C",
  warnDim: "#E8890C12",
  danger: "#DC2626",
  dangerDim: "#DC262612",
  blue: "#2563EB",
  blueDim: "#2563EB10",
  purple: "#7C3AED",
  purpleDim: "#7C3AED10",
  text: "#1E293B",
  textMid: "#64748B",
  textDim: "#94A3B8",
  shadow: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)",
  shadowLg: "0 4px 14px rgba(0,0,0,0.06)",
  inputBg: "#F1F5F9",
};

export const DARK: ColorTokens = {
  bg: "#0C111D",
  sidebar: "#111827",
  card: "#1E293B",
  cardHover: "#243044",
  border: "#334155",
  accent: "#3B82F6",
  accentDim: "#3B82F614",
  accentGlow: "#3B82F640",
  onAccent: "#FFFFFF",
  success: "#22c55e",
  successDim: "#22c55e14",
  warn: "#F59E0B",
  warnDim: "#F59E0B14",
  danger: "#EF4444",
  dangerDim: "#EF444414",
  blue: "#3B82F6",
  blueDim: "#3B82F614",
  purple: "#A78BFA",
  purpleDim: "#A78BFA14",
  text: "#F1F5F9",
  textMid: "#94A3B8",
  textDim: "#475569",
  shadow: "0 1px 3px rgba(0,0,0,0.4)",
  shadowLg: "0 4px 14px rgba(0,0,0,0.5)",
  inputBg: "#1E293B",
};

export const FONT = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', 'Fira Code', monospace";

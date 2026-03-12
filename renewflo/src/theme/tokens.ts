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
  bg: "#F6F7FA",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  cardHover: "#F0F2F8",
  border: "#E2E6EF",
  accent: "#00B894",
  accentDim: "#00B89412",
  accentGlow: "#00B89444",
  warn: "#F0932B",
  warnDim: "#F0932B14",
  danger: "#EB4D5C",
  dangerDim: "#EB4D5C14",
  blue: "#4A6CF7",
  blueDim: "#4A6CF714",
  purple: "#8B5CF6",
  purpleDim: "#8B5CF614",
  text: "#1A1F36",
  textMid: "#6B7794",
  textDim: "#B0B8CC",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowLg: "0 4px 14px rgba(0,0,0,0.06)",
  inputBg: "#F0F2F8",
};

export const DARK: ColorTokens = {
  bg: "#0B0F1A",
  sidebar: "#0F1422",
  card: "#151B2E",
  cardHover: "#1A2240",
  border: "#1E2745",
  accent: "#00D4AA",
  accentDim: "#00D4AA16",
  accentGlow: "#00D4AA44",
  warn: "#FFB020",
  warnDim: "#FFB02016",
  danger: "#FF4D6A",
  dangerDim: "#FF4D6A16",
  blue: "#5B8DEF",
  blueDim: "#5B8DEF16",
  purple: "#A78BFA",
  purpleDim: "#A78BFA16",
  text: "#E8ECF4",
  textMid: "#8B95AD",
  textDim: "#4A5578",
  shadow: "0 1px 3px rgba(0,0,0,0.3)",
  shadowLg: "0 4px 14px rgba(0,0,0,0.4)",
  inputBg: "#1A2240",
};

export const FONT = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', 'Fira Code', monospace";

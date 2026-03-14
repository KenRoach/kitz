import type { AssetStatus, AssetTier } from "@/types";
import type { ColorTokens } from "@/theme";

export function tierColor(colors: ColorTokens, tier: AssetTier): string {
  const map: Record<AssetTier, string> = {
    critical: colors.danger,
    standard: colors.blue,
    "low-use": colors.textMid,
    eol: colors.textDim,
  };
  return map[tier] ?? colors.textMid;
}

export function urgencyColor(colors: ColorTokens, daysLeft: number): string {
  if (daysLeft <= 7) return colors.danger;
  if (daysLeft <= 30) return colors.warn;
  if (daysLeft <= 60) return colors.blue;
  return colors.accent;
}

export function statusLabel(status: AssetStatus): string {
  const map: Record<AssetStatus, string> = {
    discovered: "Discovered",
    "alerted-7": "7 days",
    "alerted-14": "14 days",
    "alerted-30": "30 days",
    "alerted-60": "60 days",
    "alerted-90": "90 days",
    quoted: "Quoted",
    "tpm-approved": "TPM Approved",
    "oem-approved": "OEM Approved",
    fulfilled: "Active",
    lost: "Lost",
    lapsed: "Lapsed",
  };
  return map[status] ?? status;
}

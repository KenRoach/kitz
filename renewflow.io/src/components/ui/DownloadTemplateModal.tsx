"use client";

import type { FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";

interface DownloadTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

interface ColumnInfo {
  label: string;
  required: boolean;
}

const COLUMNS: ColumnInfo[] = [
  { label: "Serial Number", required: true },
  { label: "Brand / Manufacturer", required: true },
  { label: "Model", required: true },
  { label: "Client / Account", required: true },
  { label: "Warranty End Date", required: false },
  { label: "Device Type", required: false },
  { label: "Purchase Date", required: false },
  { label: "Quantity", required: false },
];

export const DownloadTemplateModal: FC<DownloadTemplateModalProps> = ({
  open,
  onClose,
  onDownload,
}) => {
  const { colors } = useTheme();

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.card,
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          width: 520,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: colors.shadowLg,
          fontFamily: FONT,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>
              Download Asset Template
            </h2>
            <p style={{ fontSize: 12, color: colors.textMid, margin: "4px 0 0" }}>
              Pre-formatted spreadsheet for importing your installed base
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" size={18} color={colors.textDim} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Column list */}
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 10,
              }}
            >
              Template columns included:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: colors.inputBg,
                borderRadius: 10,
                padding: "12px 16px",
                border: `1px solid ${colors.border}`,
              }}
            >
              {COLUMNS.map((col) => (
                <div
                  key={col.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon name="check" size={14} color={colors.accent} />
                  <span style={{ fontSize: 13, color: colors.text, lineHeight: 1.4 }}>
                    {col.label}
                  </span>
                  {col.required && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: colors.accent,
                        background: colors.accentDim,
                        padding: "1px 6px",
                        borderRadius: 4,
                        marginLeft: 2,
                      }}
                    >
                      required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Format info */}
          <div
            style={{
              fontSize: 12,
              color: colors.textMid,
              lineHeight: 1.5,
              background: colors.inputBg,
              borderRadius: 8,
              padding: "10px 14px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <strong style={{ color: colors.text }}>Format:</strong> .xlsx (Excel) — compatible with
            Excel, Google Sheets, and LibreOffice
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "none",
              color: colors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: colors.accent,
              color: colors.onAccent,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              boxShadow: `0 2px 8px ${colors.accent}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Icon name="download" size={14} color="#fff" />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
};

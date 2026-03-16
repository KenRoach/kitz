"use client";

import { useState, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";

interface NewTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (ticket: {
    client: string;
    device: string;
    priority: "critical" | "high" | "medium" | "low";
    issue: string;
    assignee: string;
  }) => void;
}

const PRIORITY_OPTIONS: { value: "critical" | "high" | "medium" | "low"; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const NewTicketModal: FC<NewTicketModalProps> = ({ open, onClose, onSubmit }) => {
  const { colors } = useTheme();

  const [client, setClient] = useState("");
  const [device, setDevice] = useState("");
  const [priority, setPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [issue, setIssue] = useState("");
  const [assignee, setAssignee] = useState("");

  if (!open) return null;

  const canSubmit = issue.trim().length > 0;

  const handleSubmit = (): void => {
    if (!canSubmit) return;
    onSubmit({
      client: client.trim(),
      device: device.trim(),
      priority,
      issue: issue.trim(),
      assignee: assignee.trim(),
    });
    setClient("");
    setDevice("");
    setPriority("medium");
    setIssue("");
    setAssignee("");
    onClose();
  };

  const handleCancel = (): void => {
    setClient("");
    setDevice("");
    setPriority("medium");
    setIssue("");
    setAssignee("");
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    fontSize: 12,
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      onClick={handleCancel}
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
              New Support Ticket
            </h2>
            <p style={{ fontSize: 12, color: colors.textMid, margin: "4px 0 0" }}>
              Create a ticket to track and resolve an issue
            </p>
          </div>
          <button
            onClick={handleCancel}
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

        {/* Form */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Client Name */}
          <div>
            <label style={labelStyle}>Client Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Device */}
          <div>
            <label style={labelStyle}>Device</label>
            <input
              type="text"
              placeholder="e.g. Dell Precision 5570 / SN: ABC123"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Priority */}
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "critical" | "high" | "medium" | "low")}
              style={{
                ...inputStyle,
                appearance: "auto",
              }}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Description */}
          <div>
            <label style={labelStyle}>
              Issue Description <span style={{ color: colors.danger }}>*</span>
            </label>
            <textarea
              placeholder="Describe the issue..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Assignee */}
          <div>
            <label style={labelStyle}>
              Assignee{" "}
              <span style={{ fontWeight: 400, color: colors.textMid }}>(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. John D."
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "transparent",
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
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: canSubmit ? colors.accent : colors.textDim,
              color: colors.onAccent,
              fontSize: 13,
              fontWeight: 600,
              cursor: canSubmit ? "pointer" : "not-allowed",
              fontFamily: FONT,
              boxShadow: canSubmit ? `0 2px 8px ${colors.accent}40` : "none",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            Create Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

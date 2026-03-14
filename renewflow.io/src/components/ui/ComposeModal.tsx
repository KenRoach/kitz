"use client";

import { useState, useEffect, type FC } from "react";
import { useTheme, FONT } from "@/theme";
import { Icon } from "@/components/icons";

// ─── Types ───

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: {
    to: string;
    subject: string;
    body: string;
    template: string;
    cc?: string;
  }) => void;
  /** Pre-fill for replies */
  replyTo?: { to: string; subject: string };
}

type TemplateName = "quote-followup" | "renewal-reminder" | "promo" | "custom";

interface TemplateOption {
  key: TemplateName;
  label: string;
  subject: string;
  body: string;
}

// ─── Template definitions ───

const TEMPLATES: TemplateOption[] = [
  {
    key: "quote-followup",
    label: "Quote Follow-up",
    subject: "Your Warranty Quote from [Company]",
    body: `Hi [Customer],

Thank you for your interest in warranty coverage for your IT assets. Below is a summary of your recent quote:

[Quote details will be attached]

Key highlights:
\u2022 TPM coverage available at up to 40% savings vs OEM pricing
\u2022 Coverage begins immediately upon order fulfillment
\u2022 24/7 support included for critical-tier devices

Please review and let us know if you have any questions. We're happy to adjust coverage levels to fit your budget.

Best regards,
[Your Name]
RenewFlow Partner`,
  },
  {
    key: "renewal-reminder",
    label: "Renewal Reminder",
    subject: "Warranty Renewal Notice",
    body: `Hi [Customer],

This is a friendly reminder that warranty coverage for the following devices is approaching expiration:

[Device details will be inserted]

To ensure uninterrupted coverage, we recommend renewing before the expiration date. We can provide competitive quotes for both OEM and TPM coverage options.

Would you like us to prepare a renewal quote? Simply reply to this email and we'll have options ready within 24 hours.

Best regards,
[Your Name]
RenewFlow Partner`,
  },
  {
    key: "promo",
    label: "Promo / Special Offer",
    subject: "Special Offer: Extended Warranty Savings",
    body: `Hi [Customer],

We're excited to share an exclusive offer for our valued partners:

LIMITED TIME: Save up to [X]% on TPM warranty coverage

This special pricing is available for:
\u2022 All laptop and desktop warranties
\u2022 Server coverage (1-year and 3-year terms)
\u2022 Multi-device fleet discounts

This offer expires [Date]. Contact us today to lock in these savings for your organization.

Request a quote now and let us show you how much you can save.

Best regards,
[Your Name]
RenewFlow Partner`,
  },
  {
    key: "custom",
    label: "Custom",
    subject: "",
    body: "",
  },
];

// ─── Component ───

export const ComposeModal: FC<ComposeModalProps> = ({
  open,
  onClose,
  onSend,
  replyTo,
}) => {
  const { colors } = useTheme();

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState<TemplateName>("custom");

  // Reset state when modal opens or replyTo changes
  useEffect(() => {
    if (!open) return;

    if (replyTo) {
      setTo(replyTo.to);
      const replySubject = replyTo.subject.startsWith("Re: ")
        ? replyTo.subject
        : `Re: ${replyTo.subject}`;
      setSubject(replySubject);
      setBody("");
      setTemplate("custom");
      setCc("");
      setShowCc(false);
    } else {
      setTo("");
      setSubject("");
      setBody("");
      setTemplate("custom");
      setCc("");
      setShowCc(false);
    }
  }, [open, replyTo]);

  const handleTemplateSelect = (tmpl: TemplateOption) => {
    setTemplate(tmpl.key);
    // Only overwrite subject/body if not replying
    if (!replyTo) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    } else {
      // For replies keep the reply subject, but populate the body
      setBody(tmpl.body);
    }
  };

  const canSend = to.trim().length > 0 && subject.trim().length > 0 && body.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend({
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      template,
      cc: cc.trim() || undefined,
    });
  };

  if (!open) return null;

  // ─── Shared styles ───

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 13,
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMid,
    marginBottom: 4,
    display: "block",
  };

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
          width: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: colors.shadowLg,
          fontFamily: FONT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="email" size={20} color={colors.accent} />
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.text,
                  margin: 0,
                }}
              >
                Compose Email
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: colors.textMid,
                  margin: "4px 0 0",
                }}
              >
                Send to customers and partners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
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

        {/* ── Body ── */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* Template selector */}
          <div>
            <span style={labelStyle}>Template</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TEMPLATES.map((tmpl) => {
                const selected = template === tmpl.key;
                return (
                  <button
                    key={tmpl.key}
                    onClick={() => handleTemplateSelect(tmpl)}
                    style={{
                      background: selected ? colors.accentDim : "transparent",
                      border: selected
                        ? `1px solid ${colors.accent}40`
                        : `1px solid ${colors.border}`,
                      color: selected ? colors.accent : colors.textMid,
                      fontWeight: selected ? 600 : 400,
                      borderRadius: 20,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontFamily: FONT,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tmpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* To field */}
          <div>
            <label style={labelStyle}>To</label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* CC field (expandable) */}
          {!showCc ? (
            <button
              onClick={() => setShowCc(true)}
              style={{
                background: "none",
                border: "none",
                color: colors.accent,
                fontSize: 12,
                fontFamily: FONT,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 4,
                alignSelf: "flex-start",
              }}
            >
              <Icon name="plus" size={14} color={colors.accent} />
              Add CC
            </button>
          ) : (
            <div>
              <label style={labelStyle}>CC</label>
              <input
                type="email"
                placeholder="cc@example.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* Subject field */}
          <div>
            <label style={labelStyle}>Subject</label>
            <input
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Body textarea */}
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Body</label>
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 240,
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: "transparent",
              color: colors.textMid,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: canSend ? colors.accent : colors.border,
              color: canSend ? "#fff" : colors.textDim,
              fontSize: 13,
              fontWeight: 600,
              cursor: canSend ? "pointer" : "not-allowed",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: canSend ? `0 2px 8px ${colors.accent}40` : "none",
              opacity: canSend ? 1 : 0.7,
              transition: "all 0.15s ease",
            }}
          >
            <Icon name="send" size={14} color={canSend ? "#fff" : colors.textDim} />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

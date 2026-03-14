"use client";

import { useState, type FC } from "react";
import { useTheme, FONT, MONO } from "@/theme";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/icons";
import { useAuthStore } from "@/stores";
import { ROLE_LABELS, type UserRole } from "@/types";

// ─── Timezone options ───
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "Europe/London",
  "Europe/Madrid",
  "UTC",
];

// ─── Toggle switch ───
const Toggle: FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => {
  const { colors } = useTheme();
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: on ? colors.accent : colors.border,
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: on ? 18 : 2,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
};

// ─── Form field wrapper ───
const Field: FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => {
  const { colors } = useTheme();
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: colors.textMid,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 10, color: colors.textDim, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
};

export const SettingsPage: FC = () => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const user = useAuthStore((s) => s.user);
  const userRole: UserRole = user?.role || "var";

  // ─── Form state ───
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [tz, setTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  );
  const [signature, setSignature] = useState("");

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [renewalAlerts, setRenewalAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [saved, setSaved] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 13,
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394A3B8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
  };

  const handleSave = () => {
    // In production this would call an API to persist profile changes.
    // For now, update local storage for the display name.
    if (user) {
      const updated = { ...user, name };
      localStorage.setItem("renewflow_user", JSON.stringify(updated));
      // Update Zustand store directly via hydrate
      useAuthStore.getState().hydrate();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: colors.text,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Icon name="settings" size={18} color={colors.accent} />
          {t.settings}
        </h2>
        <p style={{ fontSize: 13, color: colors.textMid, margin: "4px 0 0" }}>
          {ROLE_LABELS[userRole]} &middot; {user?.email}
        </p>
      </div>

      {/* ─── Profile Section ─── */}
      <div
        style={{
          background: colors.card,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          padding: 24,
          marginBottom: 20,
          boxShadow: colors.shadow,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            margin: "0 0 18px",
          }}
        >
          {t.profileSettings}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label={t.displayName}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label={t.emailAddress} hint="Contact support to change email">
            <input
              type="email"
              value={email}
              disabled
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
            />
          </Field>

          <Field label={t.phone}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              style={inputStyle}
            />
          </Field>

          <Field label={t.timezone}>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              style={selectStyle}
            >
              {TIMEZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* ─── Company Section ─── */}
      <div
        style={{
          background: colors.card,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          padding: 24,
          marginBottom: 20,
          boxShadow: colors.shadow,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            margin: "0 0 18px",
          }}
        >
          {t.companyInfo}
        </h2>

        <Field label={t.companyName}>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            style={inputStyle}
          />
        </Field>

        <Field label={t.emailSignature} hint="Appended to outbound emails">
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={"Best regards,\nYour Name\nCompany Name"}
            rows={4}
            style={{
              ...inputStyle,
              fontFamily: MONO,
              fontSize: 12,
              resize: "vertical",
              minHeight: 80,
            }}
          />
        </Field>
      </div>

      {/* ─── Notifications Section ─── */}
      <div
        style={{
          background: colors.card,
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          padding: 24,
          marginBottom: 28,
          boxShadow: colors.shadow,
        }}
      >
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            margin: "0 0 18px",
          }}
        >
          {t.notificationPrefs}
        </h2>

        {[
          {
            label: t.emailNotifications,
            desc: "Receive email updates about your account activity",
            on: emailNotifs,
            set: setEmailNotifs,
          },
          {
            label: t.renewalAlerts,
            desc: "Get notified when warranties approach expiry dates",
            on: renewalAlerts,
            set: setRenewalAlerts,
          },
          {
            label: t.weeklyDigest,
            desc: "Summary of portfolio status every Monday",
            on: weeklyDigest,
            set: setWeeklyDigest,
          },
        ].map((pref) => (
          <div
            key={pref.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
                {pref.label}
              </div>
              <div style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>
                {pref.desc}
              </div>
            </div>
            <Toggle on={pref.on} onChange={pref.set} />
          </div>
        ))}
      </div>

      {/* ─── Save Button ─── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 28px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 600,
            background: saved ? colors.success : colors.accent,
            color: colors.onAccent,
            boxShadow: `0 2px 8px ${saved ? colors.successDim : colors.accent + "40"}`,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {saved ? (
            <>
              <Icon name="check" size={14} color={colors.onAccent} />
              {t.saved}
            </>
          ) : (
            t.saveChanges
          )}
        </button>
      </div>
    </div>
  );
};

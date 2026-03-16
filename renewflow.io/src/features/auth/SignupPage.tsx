"use client";

import { useState } from "react";
import { useTheme } from "@/theme";
import { useAuth } from "@/contexts/AuthContext";
import { FONT } from "@/theme/tokens";

export function SignupPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { colors } = useTheme();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    orgName: "",
    orgType: "var" as "var" | "delivery_partner",
    country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.text,
    fontSize: 14,
    fontFamily: FONT,
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500 as const,
    color: colors.textMid,
    marginBottom: 6,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 440,
          padding: 40,
          background: colors.card,
          borderRadius: 16,
          boxShadow: colors.shadowLg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, color: colors.text, fontWeight: 700 }}>RenewFlow</h1>
        <p style={{ color: colors.textMid, marginTop: 8, marginBottom: 32 }}>Create your account</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: colors.dangerDim,
                color: colors.danger,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={labelStyle}>Full Name</span>
            <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required style={inputStyle} />
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={labelStyle}>Email</span>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required style={inputStyle} />
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={labelStyle}>Password</span>
            <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} style={inputStyle} />
          </label>

          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={labelStyle}>Organization Name</span>
            <input type="text" value={form.orgName} onChange={(e) => update("orgName", e.target.value)} required style={inputStyle} />
          </label>

          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <label style={{ flex: 1 }}>
              <span style={labelStyle}>Account Type</span>
              <select value={form.orgType} onChange={(e) => update("orgType", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="var">Reseller (VAR)</option>
                <option value="delivery_partner">Delivery Partner</option>
              </select>
            </label>

            <label style={{ flex: 1 }}>
              <span style={labelStyle}>Country</span>
              <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="e.g. Panama" style={inputStyle} />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 8,
              background: colors.accent,
              color: colors.onAccent,
              fontWeight: 600,
              fontSize: 15,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: FONT,
              marginTop: 8,
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: colors.textMid }}>
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: "none",
              border: "none",
              color: colors.accent,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: FONT,
              padding: 0,
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

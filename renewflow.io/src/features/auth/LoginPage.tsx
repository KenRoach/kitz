"use client";

import { useState, useEffect, type FC, type FormEvent } from "react";
import { useTheme, FONT } from "@/theme";
import { useAuthStore } from "@/stores";
import { validateResetToken } from "@/services/auth";
import type { UserRole } from "@/types";

type AuthMode = "login" | "signup" | "forgot" | "reset" | "reset-success";

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: "var", label: "VAR Partner", desc: "Manage assets, quotes & renewals" },
  { value: "support", label: "Support Team", desc: "RenewFlow operations & triage" },
  { value: "delivery-partner", label: "Delivery Partner", desc: "Fulfill warranty & service POs" },
];

export const LoginPage: FC = () => {
  const { colors } = useTheme();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("var");
  const [resetToken, setResetToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const {
    login,
    signup,
    loading,
    error,
    clearError,
    resetState,
    resetError,
    requestPasswordReset,
    resetPassword,
    clearResetState,
  } = useAuthStore();

  // Check URL for reset token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset-token");
    if (token) {
      setResetToken(token);
      setMode("reset");
      // Validate token
      validateResetToken(token).then((result) => {
        setTokenValid(result.valid);
        if (result.email) setMaskedEmail(result.email);
        if (!result.valid) {
          setMode("forgot");
        }
      }).catch(() => {
        setTokenValid(false);
        setMode("forgot");
      });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Transition to success mode when reset completes
  useEffect(() => {
    if (resetState === "success" && mode === "reset") {
      setMode("reset-success");
    }
  }, [resetState, mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      await signup({ email, password, name, role });
    } else if (mode === "login") {
      await login({ email, password });
    } else if (mode === "forgot") {
      await requestPasswordReset(email);
    } else if (mode === "reset") {
      if (password !== confirmPassword) {
        return; // Handled by validation below
      }
      await resetPassword(resetToken, password);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    clearError();
    clearResetState();
    setPassword("");
    setConfirmPassword("");
    setMode(newMode);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    fontSize: 14,
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const linkBtnStyle = {
    background: "none",
    border: "none",
    color: colors.accent,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
    padding: 0,
  };

  const headings: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: "Welcome back", subtitle: "Sign in to manage your warranty renewals" },
    signup: { title: "Create your account", subtitle: "Get started with RenewFlow for free" },
    forgot: { title: "Reset your password", subtitle: "Enter your email and we'll send you a reset link" },
    reset: { title: "Choose a new password", subtitle: maskedEmail ? `Resetting password for ${maskedEmail}` : "Enter your new password below" },
    "reset-success": { title: "Password reset!", subtitle: "Your password has been changed successfully" },
  };

  const isLoading = loading || resetState === "sending" || resetState === "resetting";
  const currentError = error || resetError;
  const passwordMismatch = mode === "reset" && confirmPassword.length > 0 && password !== confirmPassword;
  const { title, subtitle } = headings[mode];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: FONT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 400,
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <path d="M4 20c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M4 15c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" opacity="0.6" />
            <path d="M4 25c2.5-3 5-5 8-5s5 2 8 2 5.5-2 8-5" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" opacity="0.35" />
          </svg>
          <span style={{ fontSize: 26, fontWeight: 700, color: colors.text, letterSpacing: "-0.02em" }}>
            RenewFlow
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: 32,
            boxShadow: colors.shadowLg,
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.text,
              margin: "0 0 6px",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: colors.textMid,
              margin: "0 0 24px",
            }}
          >
            {subtitle}
          </p>

          {/* ─── Reset Success ─── */}
          {mode === "reset-success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: colors.accentDim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill={colors.accent}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: colors.textMid, textAlign: "center", margin: 0 }}>
                You can now sign in with your new password.
              </p>
              <button
                onClick={() => switchMode("login")}
                style={{
                  background: colors.accent,
                  color: colors.onAccent,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 32px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT,
                  boxShadow: `0 2px 10px ${colors.accent}40`,
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* ─── Forgot: Email Sent Confirmation ─── */}
          {mode === "forgot" && resetState === "sent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: colors.accentDim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill={colors.accent}>
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <p style={{ fontSize: 14, color: colors.textMid, textAlign: "center", margin: 0, lineHeight: 1.5 }}>
                If an account exists with that email, you'll receive a reset link shortly. Check your inbox.
              </p>
              <button
                onClick={() => switchMode("login")}
                style={linkBtnStyle}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* ─── Forms ─── */}
          {mode !== "reset-success" && !(mode === "forgot" && resetState === "sent") && (
            <>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Signup: Name + Role */}
                {mode === "signup" && (
                  <>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMid,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        minLength={2}
                        maxLength={100}
                        style={inputStyle}
                      />
                    </div>

                    {/* Role Selector */}
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMid,
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        Account Type
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {ROLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setRole(opt.value)}
                            style={{
                              flex: 1,
                              padding: "10px 8px",
                              borderRadius: 10,
                              border: `1.5px solid ${role === opt.value ? colors.accent : colors.border}`,
                              background: role === opt.value ? colors.accentDim : "transparent",
                              cursor: "pointer",
                              fontFamily: FONT,
                              textAlign: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: role === opt.value ? colors.accent : colors.text,
                                marginBottom: 2,
                              }}
                            >
                              {opt.label}
                            </div>
                            <div
                              style={{
                                fontSize: 9,
                                color: colors.textDim,
                                lineHeight: 1.3,
                              }}
                            >
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Email (login, signup, forgot) */}
                {(mode === "login" || mode === "signup" || mode === "forgot") && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.textMid,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* Password (login, signup) */}
                {(mode === "login" || mode === "signup") && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.textMid,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                      required
                      minLength={8}
                      style={inputStyle}
                    />
                    {/* Forgot password link */}
                    {mode === "login" && (
                      <div style={{ textAlign: "right", marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          style={{
                            ...linkBtnStyle,
                            fontSize: 12,
                            fontWeight: 500,
                            color: colors.textMid,
                          }}
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* New password + confirm (reset mode) */}
                {mode === "reset" && tokenValid && (
                  <>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMid,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMid,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        minLength={8}
                        style={{
                          ...inputStyle,
                          borderColor: passwordMismatch ? colors.danger : colors.border,
                        }}
                      />
                      {passwordMismatch && (
                        <div style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>
                          Passwords do not match
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Token validating state */}
                {mode === "reset" && tokenValid === null && (
                  <div style={{ textAlign: "center", padding: 20, color: colors.textMid, fontSize: 13 }}>
                    Validating reset link...
                  </div>
                )}

                {/* Token invalid */}
                {mode === "reset" && tokenValid === false && (
                  <div
                    style={{
                      fontSize: 13,
                      color: colors.danger,
                      background: colors.dangerDim,
                      border: `1px solid ${colors.danger}25`,
                      borderRadius: 8,
                      padding: "10px 14px",
                      textAlign: "center",
                    }}
                  >
                    This reset link is invalid or expired. Please request a new one.
                  </div>
                )}

                {/* Error display */}
                {currentError && (
                  <div
                    style={{
                      fontSize: 13,
                      color: colors.danger,
                      background: colors.dangerDim,
                      border: `1px solid ${colors.danger}25`,
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    {currentError}
                  </div>
                )}

                {/* Submit button */}
                {!(mode === "reset" && tokenValid === false) && !(mode === "reset" && tokenValid === null) && (
                  <button
                    type="submit"
                    disabled={isLoading || passwordMismatch}
                    style={{
                      background: isLoading || passwordMismatch ? colors.textDim : colors.accent,
                      color: colors.onAccent,
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isLoading || passwordMismatch ? "not-allowed" : "pointer",
                      fontFamily: FONT,
                      boxShadow: isLoading ? "none" : `0 2px 10px ${colors.accent}40`,
                      opacity: isLoading || passwordMismatch ? 0.7 : 1,
                      marginTop: 4,
                    }}
                  >
                    {isLoading
                      ? "Please wait..."
                      : mode === "login"
                        ? "Sign In"
                        : mode === "signup"
                          ? "Create Account"
                          : mode === "forgot"
                            ? "Send Reset Link"
                            : "Reset Password"}
                  </button>
                )}
              </form>

              {/* Footer links */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  fontSize: 13,
                  color: colors.textMid,
                }}
              >
                {mode === "login" && (
                  <>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => switchMode("signup")} style={linkBtnStyle}>
                      Sign Up
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => switchMode("login")} style={linkBtnStyle}>
                      Sign In
                    </button>
                  </>
                )}
                {(mode === "forgot" || mode === "reset") && (
                  <>
                    Remember your password?{" "}
                    <button onClick={() => switchMode("login")} style={linkBtnStyle}>
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: colors.textDim,
            margin: 0,
          }}
        >
          Warranty renewal management for LATAM IT channel partners
        </p>
      </div>
    </div>
  );
};

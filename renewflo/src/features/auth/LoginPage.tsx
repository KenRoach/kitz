import { useState, type FC } from "react";
import { FONT } from "@/theme";
import { loginUser, resetPassword } from "@/services/gateway";

interface LoginPageProps {
  onLogin: () => void;
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #2D3154",
  background: "#161929",
  color: "#E8ECF4",
  fontSize: 14,
  fontFamily: FONT,
  marginBottom: 16,
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#8B92A5",
  marginBottom: 6,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

export const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(username, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(username, password, newPassword);
      setSuccess("Password updated. Please sign in with your new password.");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "reset" : "login");
    setError("");
    setSuccess("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0B0F1A 0%, #1A1F36 100%)",
        fontFamily: FONT,
      }}
    >
      <form
        onSubmit={mode === "login" ? handleLogin : handleReset}
        style={{
          background: "#1E2235",
          border: "1px solid #2D3154",
          borderRadius: 16,
          padding: "40px 36px",
          width: 360,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #00B894, #00A88A)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
              boxShadow: "0 4px 16px rgba(0,184,148,0.3)",
            }}
          >
            RF
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#E8ECF4", margin: 0 }}>RenewFlow</h1>
          <p style={{ fontSize: 12, color: "#8B92A5", margin: "4px 0 0" }}>
            {mode === "login" ? "Warranty Renewal Platform" : "Reset Your Password"}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#FF475720",
              border: "1px solid #FF475740",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#FF6B81",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#00B89420",
              border: "1px solid #00B89440",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#00D9A5",
              marginBottom: 16,
            }}
          >
            {success}
          </div>
        )}

        <label style={labelStyle}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          placeholder="admin"
          autoFocus
        />

        <label style={labelStyle}>
          {mode === "login" ? "Password" : "Current Password"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={mode === "login" ? { ...inputStyle, marginBottom: 24 } : inputStyle}
          placeholder={mode === "login" ? "admin" : "Enter current password"}
        />

        {mode === "reset" && (
          <>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter new password"
            />

            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ ...inputStyle, marginBottom: 24 }}
              placeholder="Confirm new password"
            />
          </>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !username ||
            !password ||
            (mode === "reset" && (!newPassword || !confirmPassword))
          }
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 9,
            border: "none",
            background: loading ? "#555" : "linear-gradient(135deg, #00B894, #00A88A)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            fontFamily: FONT,
            boxShadow: "0 4px 12px rgba(0,184,148,0.25)",
          }}
        >
          {loading
            ? mode === "login" ? "Signing in..." : "Resetting..."
            : mode === "login" ? "Sign In" : "Reset Password"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#8B92A5", marginTop: 16, margin: "16px 0 0" }}>
          <button
            type="button"
            onClick={switchMode}
            style={{
              background: "none",
              border: "none",
              color: "#00B894",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: FONT,
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Reset password" : "Back to sign in"}
          </button>
        </p>

        {mode === "login" && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#555", margin: "8px 0 0" }}>
            Default: admin / admin
          </p>
        )}
      </form>
    </div>
  );
};

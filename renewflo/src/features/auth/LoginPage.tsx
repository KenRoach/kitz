import { useState, type FC } from "react";
import { FONT } from "@/theme";
import { loginUser, resetPassword, registerUser } from "@/services/gateway";

interface LoginPageProps {
  onLogin: () => void;
}

type Mode = "login" | "register" | "reset";

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

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#00B894",
  fontSize: 11,
  cursor: "pointer",
  fontFamily: FONT,
  textDecoration: "underline" as const,
};

export const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<Mode>("login");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      await registerUser(username, password);
      setSuccess("Account created! Please sign in.");
      setPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

  const switchTo = (target: Mode) => {
    setMode(target);
    setError("");
    setSuccess("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const subtitle: Record<Mode, string> = {
    login: "Warranty Renewal Platform",
    register: "Create Your Account",
    reset: "Reset Your Password",
  };

  const submitLabel: Record<Mode, [string, string]> = {
    login: ["Sign In", "Signing in..."],
    register: ["Create Account", "Creating..."],
    reset: ["Reset Password", "Resetting..."],
  };

  const handlers: Record<Mode, (e: React.FormEvent) => Promise<void>> = {
    login: handleLogin,
    register: handleRegister,
    reset: handleReset,
  };

  const isDisabled =
    loading ||
    !username ||
    !password ||
    (mode === "register" && !confirmPassword) ||
    (mode === "reset" && (!newPassword || !confirmPassword));

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
        onSubmit={handlers[mode]}
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
          <p style={{ fontSize: 12, color: "#8B92A5", margin: "4px 0 0" }}>{subtitle[mode]}</p>
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
          placeholder={mode === "register" ? "Choose a username" : "admin"}
          autoFocus
        />

        <label style={labelStyle}>
          {mode === "reset" ? "Current Password" : "Password"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={mode === "login" ? { ...inputStyle, marginBottom: 24 } : inputStyle}
          placeholder={mode === "register" ? "Choose a password" : mode === "reset" ? "Enter current password" : "admin"}
        />

        {mode === "register" && (
          <>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ ...inputStyle, marginBottom: 24 }}
              placeholder="Confirm your password"
            />
          </>
        )}

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
          disabled={isDisabled}
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
          {loading ? submitLabel[mode][1] : submitLabel[mode][0]}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          {mode === "login" && (
            <>
              <button type="button" onClick={() => switchTo("register")} style={linkBtnStyle}>
                Create an account
              </button>
              <button type="button" onClick={() => switchTo("reset")} style={linkBtnStyle}>
                Reset password
              </button>
            </>
          )}
          {mode !== "login" && (
            <button type="button" onClick={() => switchTo("login")} style={linkBtnStyle}>
              Back to sign in
            </button>
          )}
        </div>

        {mode === "login" && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#555", margin: "8px 0 0" }}>
            Default: admin / admin
          </p>
        )}
      </form>
    </div>
  );
};

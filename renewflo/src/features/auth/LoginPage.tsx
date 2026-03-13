import { useState, type FC } from "react";
import { FONT } from "@/theme";
import { loginUser } from "@/services/gateway";

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        onSubmit={handleSubmit}
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
          <p style={{ fontSize: 12, color: "#8B92A5", margin: "4px 0 0" }}>Warranty Renewal Platform</p>
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

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8B92A5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
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
            boxSizing: "border-box",
          }}
          placeholder="admin"
          autoFocus
        />

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#8B92A5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #2D3154",
            background: "#161929",
            color: "#E8ECF4",
            fontSize: 14,
            fontFamily: FONT,
            marginBottom: 24,
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="admin"
        />

        <button
          type="submit"
          disabled={loading || !username || !password}
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
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 16, margin: "16px 0 0" }}>
          Default: admin / admin
        </p>
      </form>
    </div>
  );
};

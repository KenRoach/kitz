import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { ThemeContext, LIGHT, DARK, FONT } from "@/theme";
import { Sidebar } from "@/components/layout";
import { DashboardPage } from "@/features/dashboard";
import { QuoterPage } from "@/features/quoter";
import { InboxPage } from "@/features/inbox";
import { NotificationsPage } from "@/features/notifications";
import { ImportModule } from "@/features/import";
import { SupportLogsPage } from "@/features/support";
import { RewardsPage } from "@/features/rewards";
import { OrdersPage } from "@/features/orders";
import { InsightsPage } from "@/features/insights";
import { ChatPanel } from "@/features/chat";
import type { Asset, PageId } from "@/types";
import { useAssetStore } from "@/stores";

const isEmbedded = new URLSearchParams(window.location.search).has("embedded");

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "DM Sans, sans-serif" }}>
          <h2 style={{ color: "#FF4757", marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: "#8B92A5", marginBottom: 16 }}>An unexpected error occurred. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "#00B894", color: "#fff", cursor: "pointer", fontSize: 14 }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState<PageId>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => !!localStorage.getItem("rf_token"));

  const assets = useAssetStore((s) => s.assets);
  const addAssets = useAssetStore((s) => s.addAssets);
  const hydrate = useAssetStore((s) => s.hydrate);

  useEffect(() => { if (authenticated) hydrate(); }, [hydrate, authenticated]);

  // Listen for forced logout (401 responses)
  const handleLogout = useCallback(() => {
    localStorage.removeItem("rf_token");
    setAuthenticated(false);
  }, []);

  useEffect(() => {
    window.addEventListener("rf_logout", handleLogout);
    return () => window.removeEventListener("rf_logout", handleLogout);
  }, [handleLogout]);

  // Listen for auth token from parent Flow shell (iframe)
  useEffect(() => {
    const handleAuth = () => setAuthenticated(true);
    window.addEventListener("rf_auth_updated", handleAuth);
    return () => window.removeEventListener("rf_auth_updated", handleAuth);
  }, []);

  // Listen for page navigation from parent Flow shell
  useEffect(() => {
    if (!isEmbedded) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "rf_navigate" && event.data?.page) {
        setPage(event.data.page as PageId);
      }
      if (event.data?.type === "rf_toggle_chat") {
        setChatOpen((o) => !o);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!authenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#1A1D2E", fontFamily: "DM Sans, sans-serif", flexDirection: "column", gap: 16 }}>
        <h2 style={{ color: "#fff", margin: 0 }}>RenewFlow</h2>
        <p style={{ color: "#8B92A5", margin: 0, textAlign: "center", maxWidth: 320 }}>
          Access RenewFlow through your Flow workspace.
        </p>
        <a href="https://kitz-flow.vercel.app/flow/login" style={{ color: "#00B894", textDecoration: "none", fontSize: 14, marginTop: 8 }}>
          Go to Flow →
        </a>
      </div>
    );
  }

  const colors = isDark ? DARK : LIGHT;
  const unread = 0;
  const alerts = assets.filter((a) => a.daysLeft <= 30 && a.daysLeft >= 0).length;

  const handleImport = (newAssets: Asset[] | null) => {
    if (!newAssets) {
      setPage("dashboard");
      return;
    }
    addAssets(newAssets);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} assets={assets} />;
      case "import":
        return <ImportModule onImport={handleImport} />;
      case "quoter":
        return <QuoterPage assets={assets} onNavigate={setPage} />;
      case "inbox":
        return <InboxPage />;
      case "notifications":
        return <NotificationsPage assets={assets} />;
      case "orders":
        return <OrdersPage />;
      case "support":
        return <SupportLogsPage />;
      case "rewards":
        return <RewardsPage />;
      case "insights":
        return <InsightsPage />;
      default:
        return <DashboardPage setPage={setPage} assets={assets} />;
    }
  };

  return (
    <ErrorBoundary>
    <ThemeContext.Provider value={{ colors, isDark, toggle: () => setIsDark((d) => !d) }}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          background: colors.bg,
          fontFamily: FONT,
          color: colors.text,
          overflow: "hidden",
          transition: "background 0.3s ease",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {!isEmbedded && (
          <Sidebar
            activePage={page}
            onNavigate={setPage}
            chatOpen={chatOpen}
            onToggleChat={() => setChatOpen((o) => !o)}
            unreadCount={unread}
            alertCount={alerts}
          />
        )}

        <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>{renderPage()}</div>
      </div>
    </ThemeContext.Provider>
    </ErrorBoundary>
  );
}

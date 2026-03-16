"use client";

import { useState, useEffect } from "react";
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
import { PipelinePage } from "@/features/pipeline";
import { SettingsPage } from "@/features/settings";
import { HowItWorksPage } from "@/features/how-it-works";
import { ChatPanel } from "@/features/chat";
import { LoginPage } from "@/features/auth";
import { ErrorBoundary, PageTransition } from "@/components/ui";
import type { Asset, PageId, UserRole } from "@/types";
import { useAssetStore, useAuthStore } from "@/stores";
import { PURCHASE_ORDERS } from "@/data/seeds";

const LOCALE_STORAGE_KEY = "renewflow_locale";

// ─── Role-based page access ───
const ROLE_PAGES: Record<UserRole, PageId[]> = {
  var: ["dashboard", "inbox", "notifications", "quoter", "orders", "import", "support", "rewards", "pipeline", "settings", "how-it-works"],
  support: ["dashboard", "notifications", "support", "orders", "inbox", "quoter", "rewards", "pipeline", "settings", "how-it-works"],
  "delivery-partner": ["dashboard", "notifications", "orders", "support", "inbox", "pipeline", "quoter", "settings", "how-it-works"],
};

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [page, setPage] = useState<PageId>("dashboard");
  const [chatOpen, setChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const assets = useAssetStore((s) => s.assets);
  const addAssets = useAssetStore((s) => s.addAssets);
  const loadFromApi = useAssetStore((s) => s.loadFromApi);
  const assetsLoaded = useAssetStore((s) => s.loaded);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);

  const userRole: UserRole = user?.role || "var";

  // Hydrate auth from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Listen for auth expiry events
  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener("renewflow:auth-expired", handleExpired);
    return () => window.removeEventListener("renewflow:auth-expired", handleExpired);
  }, [logout]);

  // Load assets when authenticated
  useEffect(() => {
    if (user && token && !assetsLoaded) {
      loadFromApi();
    }
  }, [user, token, assetsLoaded, loadFromApi]);

  // Role-based page guard
  useEffect(() => {
    const allowed = ROLE_PAGES[userRole] || ROLE_PAGES.var;
    if (!allowed.includes(page)) {
      setPage("dashboard");
    }
  }, [userRole, page]);

  if (!mounted) return null;

  const colors = isDark ? DARK : LIGHT;

  const handleImport = (newAssets: Asset[] | null) => {
    if (!newAssets) {
      setPage("dashboard");
      return;
    }
    addAssets(newAssets);
  };

  const handleNavigate = (targetPage: PageId) => {
    const allowed = ROLE_PAGES[userRole] || ROLE_PAGES.var;
    if (allowed.includes(targetPage)) {
      setPage(targetPage);
    }
  };

  // Auth gate
  if (!user || !token) {
    return (
      <ThemeContext.Provider value={{ colors, isDark, toggle: () => setIsDark((d) => !d) }}>
        <LoginPage />
      </ThemeContext.Provider>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={handleNavigate} assets={assets} userRole={userRole} />;
      case "import":
        return <ImportModule onImport={handleImport} />;
      case "quoter":
        return <QuoterPage assets={assets} />;
      case "inbox":
        return <InboxPage />;
      case "notifications":
        return <NotificationsPage assets={assets} />;
      case "orders":
        return <OrdersPage userRole={userRole} />;
      case "support":
        return <SupportLogsPage userRole={userRole} />;
      case "rewards":
        return <RewardsPage />;
      case "pipeline":
        return <PipelinePage assets={assets} userRole={userRole} />;
      case "settings":
        return <SettingsPage />;
      case "how-it-works":
        return <HowItWorksPage />;
      default:
        return <DashboardPage setPage={handleNavigate} assets={assets} userRole={userRole} />;
    }
  };

  return (
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
        <Sidebar
          activePage={page}
          onNavigate={handleNavigate}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((o) => !o)}
          userName={user.name}
          userRole={userRole}
          onLogout={logout}
        />

        <ChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          assets={assets}
          user={user}
          orders={PURCHASE_ORDERS}
          currentPage={page}
          locale={"en"}
        />

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <ErrorBoundary>
            <PageTransition pageKey={page}>{renderPage()}</PageTransition>
          </ErrorBoundary>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

const RENEWFLOW_NAV = [
  { label: "Dashboard", page: "dashboard", section: "general" },
  { label: "Inbox", page: "inbox", section: "general" },
  { label: "Alerts", page: "notifications", section: "general" },
  { label: "Quoter", page: "quoter", section: "sales" },
  { label: "Purchase Orders", page: "orders", section: "sales" },
  { label: "Import Assets", page: "import", section: "sales" },
  { label: "Insights", page: "insights", section: "operations" },
  { label: "Support", page: "support", section: "operations" },
  { label: "Rewards", page: "rewards", section: "operations" },
] as const;

interface FlowSidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  onToggleChat?: () => void;
  chatOpen?: boolean;
}

export function FlowSidebar({ activePage, onNavigate }: FlowSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { username, logout } = useAuth();
  const isRenewFlow = pathname.startsWith("/flow/renewflow");
  const [renewFlowOpen, setRenewFlowOpen] = useState(true);

  const sections = ["general", "sales", "operations"] as const;
  const sectionLabels: Record<string, string> = {
    general: "General",
    sales: "Sales",
    operations: "Operations",
  };

  function handleRenewFlowNav(page: string) {
    if (isRenewFlow) {
      onNavigate?.(page);
    } else {
      router.push(`/flow/renewflow?page=${page}`);
    }
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white flex-shrink-0">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-gray-900">Flow</span>
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
          workspace
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {/* Flow-level nav */}
        <Link
          href="/flow/dashboard"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
            !isRenewFlow && pathname.startsWith("/flow/dashboard")
              ? "bg-purple-50 text-purple-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          Dashboard
        </Link>

        {/* RenewFlow section — collapsible */}
        <div className="mt-3">
          <button
            onClick={() => setRenewFlowOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-bold transition ${
              isRenewFlow
                ? "text-purple-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>RenewFlow</span>
            <span className={`text-[10px] text-gray-400 transition-transform ${renewFlowOpen ? "rotate-90" : ""}`}>
              &#9654;
            </span>
          </button>

          {renewFlowOpen && (
            <div className="mt-1">
              {sections.map((section) => {
                const items = RENEWFLOW_NAV.filter((i) => i.section === section);
                return (
                  <div key={section} className="mb-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {sectionLabels[section]}
                    </div>
                    {items.map((item) => {
                      const isActive = isRenewFlow && activePage === item.page;
                      return (
                        <button
                          key={item.page}
                          onClick={() => handleRenewFlowNav(item.page)}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                            isActive
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Account */}
      {username && (
        <div className="border-t border-gray-200 p-3">
          <p className="truncate text-sm font-medium text-gray-700">{username}</p>
          <button
            onClick={logout}
            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

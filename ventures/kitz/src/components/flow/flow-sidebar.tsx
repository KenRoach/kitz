"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/flow/dashboard" },
  { label: "RenewFlow", href: "/flow/renewflow" },
] as const;

export function FlowSidebar() {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-gray-900">Flow</span>
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
          workspace
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
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

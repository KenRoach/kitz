"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "grid" },
  { label: "Ventures", href: "/ventures", icon: "briefcase" },
  { label: "Agents", href: "/agents", icon: "cpu" },
  { label: "Skills", href: "/skills", icon: "zap" },
  { label: "Pipelines", href: "/pipelines", icon: "git-branch" },
  { label: "Contacts", href: "/contacts", icon: "users" },
  { label: "Deals", href: "/deals", icon: "dollar-sign" },
  { label: "Logs", href: "/logs", icon: "activity" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-gray-900">KitZ</span>
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
          OS
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

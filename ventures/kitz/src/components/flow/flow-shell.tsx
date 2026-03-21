"use client";

import { FlowSidebar } from "./flow-sidebar";

interface FlowShellProps {
  children: React.ReactNode;
  activePage?: string;
  onNavigate?: (page: string) => void;
  onToggleChat?: () => void;
}

export function FlowShell({ children, activePage, onNavigate, onToggleChat }: FlowShellProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <FlowSidebar activePage={activePage} onNavigate={onNavigate} onToggleChat={onToggleChat} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

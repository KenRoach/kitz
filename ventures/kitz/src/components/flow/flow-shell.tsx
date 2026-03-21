"use client";

import { useState, useCallback } from "react";
import { FlowSidebar } from "./flow-sidebar";
import { ChatPanel } from "./chat-panel";

interface FlowShellProps {
  children: React.ReactNode;
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export function FlowShell({ children, activePage, onNavigate }: FlowShellProps) {
  const [chatOpen, setChatOpen] = useState(false);

  const handleToggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <FlowSidebar
        activePage={activePage}
        onNavigate={onNavigate}
        onToggleChat={handleToggleChat}
        chatOpen={chatOpen}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

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
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating chat bubble — bottom-right */}
      {!chatOpen && (
        <button
          onClick={handleToggleChat}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:scale-105 hover:bg-purple-700"
          title="AI Chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}

"use client";

const MESSAGES = [
  { id: 1, from: "Carlos Mendez (Grupo Alfa)", subject: "Re: Warranty renewal quote for 12 devices", time: "2h ago", unread: true },
  { id: 2, from: "Ana Rivera (Rex Distribution)", subject: "Need updated quote for HP EliteBooks", time: "5h ago", unread: true },
  { id: 3, from: "Diego Torres (Modern Arch)", subject: "PO approved — Dell Precision 5680", time: "1d ago", unread: false },
  { id: 4, from: "Maria Santos (Café Central)", subject: "Thanks for the quick turnaround!", time: "2d ago", unread: false },
  { id: 5, from: "Roberto Diaz (Beta Investments)", subject: "Request for asset inventory review", time: "3d ago", unread: false },
];

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-500">Messages from your clients</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {MESSAGES.map((m) => (
          <div key={m.id} className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${m.unread ? "bg-purple-50/50" : ""}`}>
            {m.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-purple-600" />}
            {!m.unread && <span className="h-2 w-2 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className={`text-sm truncate ${m.unread ? "font-semibold text-gray-900" : "text-gray-700"}`}>{m.from}</p>
              <p className="text-xs text-gray-500 truncate">{m.subject}</p>
            </div>
            <span className="shrink-0 text-xs text-gray-400">{m.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

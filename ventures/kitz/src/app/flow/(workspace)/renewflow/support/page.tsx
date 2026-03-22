"use client";

const TICKETS = [
  { id: "TK-101", subject: "Warranty claim — HP EliteDesk won't POST", client: "Grupo Alfa", status: "open", priority: "high" },
  { id: "TK-100", subject: "Need RMA for Dell Latitude screen", client: "Modern Arch", status: "in_progress", priority: "medium" },
  { id: "TK-099", subject: "Invoice correction request", client: "Café Central", status: "resolved", priority: "low" },
];

const statusStyles: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500">Customer support tickets</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        {TICKETS.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-purple-700">{t.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyles[t.status]}`}>{t.status.replace("_", " ")}</span>
              </div>
              <p className="mt-0.5 text-sm font-medium text-gray-900">{t.subject}</p>
              <p className="text-xs text-gray-500">{t.client}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

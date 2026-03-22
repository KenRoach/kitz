"use client";

const ALERTS = [
  { id: 1, type: "urgent", title: "3 devices warranty lapsed", desc: "Grupo Alfa — HP EliteDesk 800 G9 (3 units)", time: "Today" },
  { id: 2, type: "warning", title: "2 devices expiring in 7 days", desc: "Grupo Alfa — Dell Latitude 5540", time: "Today" },
  { id: 3, type: "warning", title: "1 device expiring in 14 days", desc: "Rex Distribution — HP EliteBook 840 G10", time: "Yesterday" },
  { id: 4, type: "info", title: "Quote QTE-003 pending approval", desc: "Modern Arch — Dell Precision 5680", time: "2d ago" },
  { id: 5, type: "success", title: "PO-001 completed", desc: "Café Central — 2 devices renewed", time: "3d ago" },
];

const typeStyles: Record<string, string> = {
  urgent: "border-l-red-500 bg-red-50",
  warning: "border-l-yellow-500 bg-yellow-50",
  info: "border-l-blue-500 bg-blue-50",
  success: "border-l-green-500 bg-green-50",
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-500">Warranty expiration alerts and system notifications</p>
      </div>
      <div className="space-y-3">
        {ALERTS.map((a) => (
          <div key={a.id} className={`rounded-lg border border-gray-200 border-l-4 p-4 shadow-sm ${typeStyles[a.type]}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
              <span className="text-xs text-gray-400">{a.time}</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

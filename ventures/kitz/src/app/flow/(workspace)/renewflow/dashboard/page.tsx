"use client";

const PIPELINE = [
  { id: 1, client: "Grupo Alfa", devices: 12, value: 1740, stage: "identified" },
  { id: 2, client: "Rex Distribution", devices: 5, value: 595, stage: "quoted" },
  { id: 3, client: "Modern Arch", devices: 3, value: 687, stage: "quoted" },
  { id: 4, client: "Beta Investments", devices: 8, value: 920, stage: "identified" },
  { id: 5, client: "Café Central", devices: 2, value: 198, stage: "closed_won" },
];

const STAGES: Record<string, { label: string; color: string }> = {
  identified: { label: "Identified", color: "bg-blue-100 text-blue-700" },
  quoted: { label: "Quoted", color: "bg-yellow-100 text-yellow-700" },
  closed_won: { label: "Closed Won", color: "bg-green-100 text-green-700" },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RenewFlow Dashboard</h1>
        <p className="text-gray-500">Warranty renewal pipeline overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Assets", value: "30", sub: "across 5 clients" },
          { label: "Expiring (90d)", value: "8", sub: "action needed" },
          { label: "Active Quotes", value: "2", sub: "$1,282 pipeline" },
          { label: "Revenue (MTD)", value: "$198", sub: "1 closed deal" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">{m.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="text-xs text-gray-500">{m.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Renewal Pipeline</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 pl-4">Client</th>
                <th className="py-3">Devices</th>
                <th className="py-3">Value</th>
                <th className="py-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {PIPELINE.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pl-4 font-medium text-gray-900">{p.client}</td>
                  <td className="py-3 text-gray-600">{p.devices}</td>
                  <td className="py-3 font-semibold text-gray-900">${p.value.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STAGES[p.stage].color}`}>
                      {STAGES[p.stage].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

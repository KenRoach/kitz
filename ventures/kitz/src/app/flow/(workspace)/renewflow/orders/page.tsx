"use client";

const ORDERS = [
  { id: "PO-001", client: "Café Central", devices: 2, total: 198, status: "completed", date: "2026-03-19" },
  { id: "PO-002", client: "Rex Distribution", devices: 5, total: 595, status: "pending", date: "2026-03-21" },
  { id: "PO-003", client: "Modern Arch", devices: 1, total: 229, status: "draft", date: "2026-03-22" },
];

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  draft: "bg-gray-100 text-gray-600",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <p className="text-gray-500">Track and manage purchase orders</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <th className="py-3 pl-4">PO #</th>
              <th className="py-3">Client</th>
              <th className="py-3">Devices</th>
              <th className="py-3">Total</th>
              <th className="py-3">Status</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pl-4 font-mono text-sm font-semibold text-purple-700">{o.id}</td>
                <td className="py-3 text-gray-900">{o.client}</td>
                <td className="py-3 text-gray-600">{o.devices}</td>
                <td className="py-3 font-semibold text-gray-900">${o.total}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[o.status]}`}>{o.status}</span>
                </td>
                <td className="py-3 text-gray-500">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

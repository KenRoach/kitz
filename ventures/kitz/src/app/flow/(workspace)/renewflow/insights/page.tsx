"use client";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-500">Analytics and reporting on renewals and revenue</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Renewal Rate", value: "68%", sub: "vs 54% last quarter", trend: "up" },
          { label: "Avg Quote Value", value: "$427", sub: "+12% MoM", trend: "up" },
          { label: "Time to Close", value: "4.2 days", sub: "-1.3 days vs avg", trend: "up" },
          { label: "TPM vs OEM Savings", value: "42%", sub: "avg discount for clients", trend: "up" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-400">{m.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{m.value}</p>
            <p className="mt-1 text-xs text-green-600">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

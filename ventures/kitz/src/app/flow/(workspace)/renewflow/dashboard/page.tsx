"use client";

import { FlowShell } from "@/components/flow/flow-shell";

export default function DashboardPage() {
  return (
    <FlowShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Your RenewFlow dashboard with asset metrics and renewal pipeline.</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-400">Coming soon</p>
        </div>
      </div>
    </FlowShell>
  );
}

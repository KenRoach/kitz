"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/flow/auth-provider";
import { invokeTool } from "@/lib/gateway";

interface Metrics {
  totalDevices: number;
  quotedCount: number;
  uniqueOrgs: number;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token, username } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    if (!token) return;
    invokeTool<Metrics>("get_asset_metrics", {}, token)
      .then((res) => setMetrics(res.result))
      .catch(() => {
        /* metrics unavailable */
      });
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {username ?? "..."}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Active Devices"
          value={metrics ? String(metrics.totalDevices) : "..."}
        />
        <MetricCard
          label="Quoted"
          value={metrics ? String(metrics.quotedCount) : "..."}
        />
        <MetricCard
          label="Organizations"
          value={metrics ? String(metrics.uniqueOrgs) : "..."}
        />
      </div>

      {/* Products section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Products</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/flow/renewflow"
            className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">RenewFlow</h3>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Active
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Warranty renewal platform — quotes, orders, alerts, and more
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

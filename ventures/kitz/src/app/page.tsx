import { MetricCard } from "@/components/ui/metric-card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Factory-wide overview across all ventures
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Active Ventures" value={2} subtitle="KitZ, Flow" />
        <MetricCard label="Agents" value={0} subtitle="Across all ventures" />
        <MetricCard label="Skills" value={7} subtitle="4 KitZ + 3 Flow" />
        <MetricCard label="Pipeline Runs" value={0} subtitle="Last 24h" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Agent Activity
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            No agent executions yet. Deploy a skill to get started.
          </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Deal Pipeline
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            No active deals. Create contacts and deals from a venture.
          </p>
        </section>
      </div>
    </div>
  );
}

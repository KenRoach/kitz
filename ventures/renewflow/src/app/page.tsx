import { ventures, assets, deals } from "@/lib/services";
import type { Asset, Deal, Venture } from "@/types";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const pipelineBuckets = [
  { key: "discovered", label: "Discovered", statuses: ["discovered", "active"], color: "bg-gray-200 text-gray-800" },
  { key: "alerted", label: "Alerted", statuses: ["alerted", "contacted"], color: "bg-blue-200 text-blue-800" },
  { key: "quoted", label: "Quoted", statuses: ["quoted", "qualified"], color: "bg-yellow-200 text-yellow-800" },
  { key: "approved", label: "Approved", statuses: ["approved", "negotiation"], color: "bg-green-200 text-green-800" },
  { key: "fulfilled", label: "Fulfilled", statuses: ["fulfilled", "closed_won", "closed"], color: "bg-emerald-200 text-emerald-800" },
] as const;

export default async function DashboardPage() {
  let assetList: Asset[] = [];
  let dealList: Deal[] = [];
  let error: string | null = null;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (!flow) {
      error = "Flow venture not found. Please create it in KitZ first.";
    } else {
      try {
        assetList = await assets.list(flow.id);
      } catch {
        assetList = [];
      }
      try {
        dealList = await deals.list(flow.id);
      } catch {
        dealList = [];
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to connect to services";
  }

  const now = Date.now();
  const thirtyDaysMs = 30 * 86400000;

  const expiringIn30 = assetList.filter((a) => {
    if (!a.warrantyEnd) return false;
    const diff = new Date(a.warrantyEnd).getTime() - now;
    return diff >= 0 && diff <= thirtyDaysMs;
  }).length;

  const pipelineValue = dealList.reduce((sum, d) => sum + (d.value || 0), 0);

  const metrics = [
    { label: "Total Assets", value: assetList.length.toString(), accent: "border-gray-900" },
    { label: "Expiring in 30d", value: expiringIn30.toString(), accent: "border-yellow-500" },
    { label: "Active Deals", value: dealList.length.toString(), accent: "border-blue-500" },
    { label: "Pipeline Value", value: formatCurrency(pipelineValue), accent: "border-green-500" },
  ];

  // Count assets per pipeline bucket
  const bucketCounts: Record<string, number> = {};
  for (const bucket of pipelineBuckets) {
    const statuses: readonly string[] = bucket.statuses;
    bucketCounts[bucket.key] = assetList.filter((a) =>
      statuses.includes(a.status.toLowerCase())
    ).length;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={`rounded-lg border-l-4 ${m.accent} bg-white border border-gray-200 p-5`}
          >
            <p className="text-sm text-gray-500 mb-1">{m.label}</p>
            <p className="text-2xl font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Renewal Pipeline */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Renewal Pipeline
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {pipelineBuckets.map((bucket) => (
              <div
                key={bucket.key}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${bucket.color}`}
              >
                <span>{bucket.label}</span>
                <span className="font-bold">{bucketCounts[bucket.key]}</span>
              </div>
            ))}
          </div>

          {/* Horizontal bar visualization */}
          {assetList.length > 0 && (
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {pipelineBuckets.map((bucket) => {
                const count = bucketCounts[bucket.key];
                if (count === 0) return null;
                const pct = (count / assetList.length) * 100;
                return (
                  <div
                    key={bucket.key}
                    className={`${bucket.color.split(" ")[0]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${bucket.label}: ${count}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

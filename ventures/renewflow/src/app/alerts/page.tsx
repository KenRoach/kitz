import { ventures, assets } from "@/lib/services";
import type { Asset, Venture } from "@/types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type UrgencyLevel = "critical" | "urgent" | "important" | "advisory" | "informational" | "lapsed";

interface AlertAsset extends Asset {
  daysLeft: number;
  urgency: UrgencyLevel;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; bg: string; text: string; border: string }> = {
  lapsed: { label: "Lapsed", bg: "bg-red-900", text: "text-white", border: "border-red-900" },
  critical: { label: "Critical", bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  urgent: { label: "Urgent", bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  important: { label: "Important", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  advisory: { label: "Advisory", bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  informational: { label: "Informational", bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
};

function classifyUrgency(daysLeft: number): UrgencyLevel {
  if (daysLeft < 0) return "lapsed";
  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 14) return "urgent";
  if (daysLeft <= 30) return "important";
  if (daysLeft <= 60) return "advisory";
  return "informational";
}

export default async function AlertsPage() {
  let alertAssets: AlertAsset[] = [];
  let error: string | null = null;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (!flow) {
      error = "Flow venture not found. Please create it in KitZ first.";
    } else {
      const allAssets: Asset[] = await assets.list(flow.id);

      alertAssets = allAssets
        .filter((a) => a.warrantyEnd !== null)
        .map((a) => {
          const daysLeft = Math.ceil(
            (new Date(a.warrantyEnd!).getTime() - Date.now()) / 86400000
          );
          return { ...a, daysLeft, urgency: classifyUrgency(daysLeft) };
        })
        .filter((a) => a.daysLeft <= 90 && a.daysLeft > -30)
        .sort((a, b) => a.daysLeft - b.daysLeft);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load alerts";
  }

  const groups: Record<UrgencyLevel, AlertAsset[]> = {
    lapsed: [],
    critical: [],
    urgent: [],
    important: [],
    advisory: [],
    informational: [],
  };

  for (const a of alertAssets) {
    groups[a.urgency].push(a);
  }

  const orderedLevels: UrgencyLevel[] = [
    "lapsed",
    "critical",
    "urgent",
    "important",
    "advisory",
    "informational",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Renewal Alerts</h1>
        <span className="text-sm text-gray-500">
          {alertAssets.length} asset{alertAssets.length !== 1 ? "s" : ""} requiring attention
        </span>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : alertAssets.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 text-lg">
            No renewal alerts at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {orderedLevels.map((level) => {
            const items = groups[level];
            if (items.length === 0) return null;
            const config = urgencyConfig[level];

            return (
              <section key={level}>
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
                  >
                    {config.label}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {items.length} asset{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((asset) => (
                    <div
                      key={asset.id}
                      className={`rounded-lg border ${config.border} bg-white p-4`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {asset.brand} {asset.model}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${config.bg} ${config.text}`}
                        >
                          {asset.daysLeft < 0
                            ? `${Math.abs(asset.daysLeft)}d overdue`
                            : asset.daysLeft === 0
                              ? "Today"
                              : `${asset.daysLeft}d left`}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p>
                          <span className="text-gray-400">Serial:</span>{" "}
                          <span className="font-mono">{asset.serial}</span>
                        </p>
                        <p>
                          <span className="text-gray-400">Client:</span>{" "}
                          {asset.clientName || "-"}
                        </p>
                        <p>
                          <span className="text-gray-400">Warranty End:</span>{" "}
                          {formatDate(asset.warrantyEnd)}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-not-allowed opacity-75"
                        disabled
                        title="Channel router configuration required"
                      >
                        Send Alert
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

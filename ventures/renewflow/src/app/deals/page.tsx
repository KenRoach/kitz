import { ventures, deals } from "@/lib/services";
import type { Deal, DealStage, Venture } from "@/types";
import DealPipelineClient from "./deal-pipeline-client";

const DEAL_STAGES: DealStage[] = [
  "identified",
  "contacted",
  "qualified",
  "quoted",
  "negotiation",
  "closed_won",
  "closed_lost",
];

const STAGE_LABELS: Record<DealStage, string> = {
  identified: "Identified",
  contacted: "Contacted",
  qualified: "Qualified",
  quoted: "Quoted",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const STAGE_COLORS: Record<DealStage, string> = {
  identified: "bg-gray-50 border-gray-200",
  contacted: "bg-blue-50 border-blue-200",
  qualified: "bg-indigo-50 border-indigo-200",
  quoted: "bg-yellow-50 border-yellow-200",
  negotiation: "bg-orange-50 border-orange-200",
  closed_won: "bg-green-50 border-green-200",
  closed_lost: "bg-red-50 border-red-200",
};

const STAGE_HEADER_COLORS: Record<DealStage, string> = {
  identified: "text-gray-700 bg-gray-100",
  contacted: "text-blue-700 bg-blue-100",
  qualified: "text-indigo-700 bg-indigo-100",
  quoted: "text-yellow-700 bg-yellow-100",
  negotiation: "text-orange-700 bg-orange-100",
  closed_won: "text-green-700 bg-green-100",
  closed_lost: "text-red-700 bg-red-100",
};

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DealsPage() {
  let dealList: Deal[] = [];
  let error: string | null = null;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (flow) {
      dealList = await deals.list(flow.id);
    } else {
      error = "Flow venture not found. Please create it in KitZ first.";
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load deals";
  }

  // Group deals by stage
  const byStage: Record<DealStage, Deal[]> = {
    identified: [],
    contacted: [],
    qualified: [],
    quoted: [],
    negotiation: [],
    closed_won: [],
    closed_lost: [],
  };
  for (const deal of dealList) {
    if (deal.stage in byStage) {
      byStage[deal.stage].push(deal);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track renewal deals through every stage
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {DEAL_STAGES.map((stage) => {
              const stageDeals = byStage[stage];
              return (
                <div
                  key={stage}
                  className={`w-56 flex-shrink-0 rounded-lg border p-3 ${STAGE_COLORS[stage]}`}
                >
                  {/* Column header */}
                  <div
                    className={`mb-3 flex items-center justify-between rounded-md px-2 py-1 ${STAGE_HEADER_COLORS[stage]}`}
                  >
                    <span className="text-xs font-semibold">
                      {STAGE_LABELS[stage]}
                    </span>
                    <span className="ml-2 rounded-full bg-white bg-opacity-60 px-1.5 py-0.5 text-xs font-bold">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deal cards */}
                  <div className="flex flex-col gap-2">
                    {stageDeals.length === 0 ? (
                      <p className="py-4 text-center text-xs text-gray-400">
                        No deals
                      </p>
                    ) : (
                      stageDeals.map((deal) => (
                        <DealPipelineClient key={deal.id} deal={deal} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

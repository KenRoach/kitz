import Link from "next/link";
import { deals, ventures } from "@/lib/services";
import type { Deal, DealStage } from "@/types";

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

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <p className="text-sm font-medium text-gray-900 leading-snug">
        {deal.title}
      </p>
      {deal.value > 0 && (
        <p className="mt-1 text-xs font-semibold text-blue-600">
          {formatCurrency(deal.value, deal.currency)}
        </p>
      )}
      <p className="mt-1.5 text-xs text-gray-400">
        Contact ID: {deal.contactId.slice(0, 8)}…
      </p>
    </div>
  );
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams?: { venture_id?: string };
}) {
  const ventureList = await ventures.list();
  const ventureId =
    searchParams?.venture_id || ventureList[0]?.id || "";
  const dealList = ventureId ? await deals.list(ventureId) : [];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sales opportunities across all ventures
        </p>
      </div>

      {/* Venture selector */}
      {ventureList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ventureList.map((v) => (
            <Link
              key={v.id}
              href={`/deals?venture_id=${v.id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                ventureId === v.id
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {v.name}
            </Link>
          ))}
        </div>
      )}

      {/* Kanban board */}
      <div className="mt-6 overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {DEAL_STAGES.map((stage) => {
            const stageDeals = byStage[stage];
            return (
              <div
                key={stage}
                className={`w-52 flex-shrink-0 rounded-lg border p-3 ${STAGE_COLORS[stage]}`}
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
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { StatusBadge } from "@/components/ui/status-badge";

const DEAL_STAGES = [
  "identified",
  "contacted",
  "qualified",
  "quoted",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export default function DealsPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sales opportunities across all ventures
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        {DEAL_STAGES.map((stage) => (
          <span
            key={stage}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500"
          >
            {stage.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-400">
          No deals in the pipeline. Deals are created from contacts within a
          venture.
        </p>
      </div>
    </div>
  );
}

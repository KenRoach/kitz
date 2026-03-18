"use client";

import { useTransition } from "react";
import type { Deal, DealStage } from "@/types";
import { updateDealStage } from "./actions";

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

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DealPipelineClient({ deal }: { deal: Deal }) {
  const [isPending, startTransition] = useTransition();

  const handleStageChange = (newStage: DealStage) => {
    if (newStage === deal.stage) return;
    startTransition(async () => {
      await updateDealStage(deal.id, newStage);
    });
  };

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
      <div className="mt-2">
        <select
          value={deal.stage}
          onChange={(e) => handleStageChange(e.target.value as DealStage)}
          disabled={isPending}
          className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50"
        >
          {DEAL_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

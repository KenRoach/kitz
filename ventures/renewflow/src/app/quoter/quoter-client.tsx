"use client";

import { useState, useTransition } from "react";
import type { Asset } from "@/types";
import { generateQuote, createDeal } from "./actions";

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "-";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuoterClient({ assets }: { assets: Asset[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quoteResult, setQuoteResult] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === assets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(assets.map((a) => a.id)));
    }
  };

  const selectedAssets = assets.filter((a) => selected.has(a.id));
  const tpmTotal = selectedAssets.reduce((sum, a) => sum + (a.tpmPrice ?? 0), 0);
  const oemTotal = selectedAssets.reduce((sum, a) => sum + (a.oemPrice ?? 0), 0);
  const savings = oemTotal > 0 ? ((oemTotal - tpmTotal) / oemTotal) * 100 : 0;

  const handleGenerateQuote = () => {
    setQuoteError(null);
    setQuoteResult(null);
    const assetData = selectedAssets.map((a) => ({
      brand: a.brand,
      model: a.model,
      serial: a.serial,
      tier: a.tier,
      tpmPrice: a.tpmPrice,
      oemPrice: a.oemPrice,
    }));
    startTransition(async () => {
      try {
        const result = await generateQuote(assetData);
        setQuoteResult(
          typeof result.output === "string"
            ? result.output
            : JSON.stringify(result.output, null, 2),
        );
        setShowQuote(true);
      } catch (e) {
        setQuoteError(
          e instanceof Error ? e.message : "Failed to generate quote. The AI service may not be configured.",
        );
        setShowQuote(true);
      }
    });
  };

  const handleCreateDeal = () => {
    const title = `TPM Quote - ${selectedAssets.length} assets`;
    startTransition(async () => {
      try {
        await createDeal(title, tpmTotal);
        setQuoteError(null);
        setQuoteResult("Deal created successfully. Redirecting to deals...");
        setShowQuote(true);
      } catch (e) {
        setQuoteError(
          e instanceof Error ? e.message : "Failed to create deal",
        );
        setShowQuote(true);
      }
    });
  };

  return (
    <div>
      {/* Asset selection table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={assets.length > 0 && selected.size === assets.length}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand + Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TPM ($)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OEM ($)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No assets available. Import assets first.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selected.has(asset.id) ? "bg-blue-50" : ""}`}
                    onClick={() => toggleSelect(asset.id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(asset.id)}
                        onChange={() => toggleSelect(asset.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {asset.brand} {asset.model}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {asset.serial}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {asset.tier || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(asset.tpmPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">
                      {formatCurrency(asset.oemPrice)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">
            {selected.size} asset{selected.size !== 1 ? "s" : ""} selected
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-700">
            TPM Total: <span className="font-semibold">{formatCurrency(tpmTotal)}</span>
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-700">
            OEM Total: <span className="font-semibold">{formatCurrency(oemTotal)}</span>
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-green-700 font-semibold">
            Savings: {savings.toFixed(1)}%
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateQuote}
            disabled={selected.size === 0 || isPending}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Generating..." : "Generate Smart Quote"}
          </button>
          <button
            onClick={handleCreateDeal}
            disabled={selected.size === 0 || isPending}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Deal
          </button>
        </div>
      </div>

      {/* Quote result / error section */}
      {showQuote && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {quoteError ? "Error" : "Smart Quote Result"}
            </h3>
            <button
              onClick={() => setShowQuote(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="p-4">
            {quoteError ? (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{quoteError}</p>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 rounded-md p-4 overflow-auto max-h-96">
                {quoteResult}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

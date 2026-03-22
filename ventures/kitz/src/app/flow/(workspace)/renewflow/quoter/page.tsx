"use client";

import { useState } from "react";

const ASSETS = [
  { id: "HP5N1R7", device: "HP EliteDesk 800 G9", client: "Grupo Alfa", tier: "standard", expires: "Lapsed", tpm: 109, oem: 0 },
  { id: "DLT67X3", device: "Dell Latitude 5540", client: "Grupo Alfa", tier: "critical", expires: "7d", tpm: 145, oem: 289 },
  { id: "HP2K9M1", device: "HP EliteBook 840 G10", client: "Rex Distribution", tier: "standard", expires: "14d", tpm: 119, oem: 0 },
  { id: "DLM2W9K", device: "Dell Precision 5680", client: "Modern Arch", tier: "critical", expires: "22d", tpm: 229, oem: 459 },
  { id: "LNV8R2P", device: "Lenovo ThinkPad T14 Gen 4", client: "Café Central", tier: "standard", expires: "28d", tpm: 99, oem: 0 },
  { id: "DLQW5N8", device: "Dell OptiPlex 7010", client: "Grupo Alfa", tier: "low-use", expires: "45d", tpm: 79, oem: 0 },
  { id: "HP7T3K2", device: "HP ProDesk 400 G9", client: "Beta Investments", tier: "standard", expires: "60d", tpm: 95, oem: 0 },
  { id: "LNVP4X1", device: "Lenovo ThinkCentre M70q", client: "TechSoluciones", tier: "low-use", expires: "88d", tpm: 69, oem: 0 },
];

function tierBadge(tier: string) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    standard: "bg-blue-100 text-blue-700",
    "low-use": "bg-gray-100 text-gray-600",
  };
  return colors[tier] || "bg-gray-100 text-gray-600";
}

function expiresBadge(expires: string) {
  if (expires === "Lapsed") return "bg-red-100 text-red-600";
  const d = parseInt(expires);
  if (d <= 14) return "bg-orange-100 text-orange-700";
  if (d <= 30) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function QuoterPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quoteGenerated, setQuoteGenerated] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedAssets = ASSETS.filter((a) => selected.has(a.id));
  const totalTpm = selectedAssets.reduce((s, a) => s + a.tpm, 0);
  const totalOem = selectedAssets.reduce((s, a) => s + a.oem, 0);

  const quoteNumber = `QTE-${String(Date.now()).slice(-6)}`;
  const today = new Date();
  const validUntil = new Date(today.getTime() + 14 * 86400000);
  const clientName = selectedAssets.length > 0 ? selectedAssets[0].client : "";

  if (quoteGenerated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <button onClick={() => setQuoteGenerated(false)} className="text-sm font-semibold text-purple-600 hover:underline">
            &larr; Back to asset selection
          </button>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              Print / PDF
            </button>
          </div>
        </div>

        {/* Branded printable quote */}
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white shadow-sm print:shadow-none print:border-0 print:max-w-none" id="quote-printable">
          {/* Header with purple brand bar */}
          <div className="bg-purple-700 px-8 py-6 text-white print:bg-purple-700 print:text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">RenewFlow</h1>
                <p className="mt-0.5 text-sm text-purple-200">Warranty Renewal Platform</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">QUOTE</p>
                <p className="text-sm text-purple-200">{quoteNumber}</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Quote meta */}
            <div className="flex justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Prepared for</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{clientName}</p>
              </div>
              <div className="text-right">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Date</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Valid Until</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{validUntil.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-purple-200 text-left text-xs font-bold uppercase text-purple-700">
                  <th className="py-3">#</th>
                  <th className="py-3">Device</th>
                  <th className="py-3">Serial</th>
                  <th className="py-3">Coverage</th>
                  <th className="py-3 text-right">TPM (12mo)</th>
                  <th className="py-3 text-right">OEM (12mo)</th>
                </tr>
              </thead>
              <tbody>
                {selectedAssets.map((a, i) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-400">{i + 1}</td>
                    <td className="py-3 font-medium text-gray-900">{a.device}</td>
                    <td className="py-3 font-mono text-xs text-gray-500">{a.id}</td>
                    <td className="py-3 text-gray-600 capitalize">{a.tier}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">${a.tpm.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-500">{a.oem ? `$${a.oem.toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal (TPM)</span>
                    <span className="font-semibold text-gray-900">${totalTpm.toFixed(2)}</span>
                  </div>
                  {totalOem > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">OEM Equivalent</span>
                      <span className="text-gray-400 line-through">${totalOem.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-base font-bold text-gray-900">Total Due</span>
                    <span className="text-base font-bold text-purple-700">${totalTpm.toFixed(2)}</span>
                  </div>
                  {totalOem > 0 && (
                    <div className="flex justify-between rounded-lg bg-green-50 px-3 py-2">
                      <span className="text-sm font-semibold text-green-700">Your Savings</span>
                      <span className="text-sm font-bold text-green-700">
                        ${(totalOem - totalTpm).toFixed(2)} ({Math.round(((totalOem - totalTpm) / totalOem) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400">Terms & Conditions</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                <li>All prices in USD. Coverage period: 12 months from activation.</li>
                <li>TPM (Third-Party Maintenance) includes hardware support, parts, and labor.</li>
                <li>Quote valid for 14 days from date of issue.</li>
                <li>Payment due within 30 days of PO acceptance.</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-700">RenewFlow</p>
                <p className="text-xs text-gray-400">Powered by KitZ</p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <p>hello@kitz.services</p>
                <p>www.renewflow.io</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quoter</h1>
          <p className="mt-1 text-gray-500">Select devices to generate a TPM + OEM quote.</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setQuoteGenerated(true)}
            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-purple-700 transition"
          >
            Generate Quote ({selected.size})
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <th className="w-10 py-3 pl-4"></th>
              <th className="py-3">Device</th>
              <th className="py-3">S/N</th>
              <th className="py-3">Client</th>
              <th className="py-3">Tier</th>
              <th className="py-3">Expires</th>
              <th className="py-3 text-right pr-4">TPM</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr
                key={a.id}
                onClick={() => toggle(a.id)}
                className={`cursor-pointer border-b border-gray-100 transition ${selected.has(a.id) ? "bg-purple-50" : "hover:bg-gray-50"}`}
              >
                <td className="pl-4">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </td>
                <td className="py-3 font-medium text-gray-900">{a.device}</td>
                <td className="py-3 font-mono text-xs text-gray-500">{a.id}</td>
                <td className="py-3 text-gray-600">{a.client}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tierBadge(a.tier)}`}>{a.tier}</span>
                </td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${expiresBadge(a.expires)}`}>{a.expires}</span>
                </td>
                <td className="py-3 text-right font-semibold text-gray-900 pr-4">${a.tpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Quote Summary · {selected.size} device(s)</p>
          <div className="mt-2 flex gap-8">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400">Total TPM</p>
              <p className="text-xl font-bold text-green-700">${totalTpm.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400">Total OEM</p>
              <p className="text-xl font-bold text-gray-600">{totalOem ? `$${totalOem.toLocaleString()}` : "$0"}</p>
            </div>
            {totalOem > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase text-gray-400">Savings</p>
                <p className="text-xl font-bold text-green-600">${(totalOem - totalTpm).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

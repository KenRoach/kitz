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

  if (quoteGenerated) {
    return (
      <div className="space-y-6">
        <button onClick={() => setQuoteGenerated(false)} className="text-sm font-semibold text-purple-600 hover:underline">
          &larr; Back to asset selection
        </button>
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm print:shadow-none" id="quote-printable">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">RenewFlow Quote</h2>
              <p className="text-sm text-gray-500">QTE-{String(Date.now()).slice(-6)}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{new Date().toLocaleDateString()}</p>
              <p>Valid for 14 days</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="py-2">Device</th>
                <th className="py-2">S/N</th>
                <th className="py-2">Client</th>
                <th className="py-2 text-right">TPM</th>
                <th className="py-2 text-right">OEM</th>
              </tr>
            </thead>
            <tbody>
              {selectedAssets.map((a) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">{a.device}</td>
                  <td className="py-3 font-mono text-xs text-gray-500">{a.id}</td>
                  <td className="py-3 text-gray-600">{a.client}</td>
                  <td className="py-3 text-right font-semibold text-gray-900">${a.tpm}</td>
                  <td className="py-3 text-right text-gray-500">{a.oem ? `$${a.oem}` : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-bold">
                <td colSpan={3} className="py-3 text-gray-900">Total</td>
                <td className="py-3 text-right text-green-700">${totalTpm.toLocaleString()}</td>
                <td className="py-3 text-right text-gray-600">{totalOem ? `$${totalOem.toLocaleString()}` : "—"}</td>
              </tr>
              {totalOem > 0 && (
                <tr className="text-sm">
                  <td colSpan={3} className="py-1 text-gray-500">TPM Savings vs OEM</td>
                  <td colSpan={2} className="py-1 text-right font-semibold text-green-600">
                    ${(totalOem - totalTpm).toLocaleString()} ({Math.round(((totalOem - totalTpm) / totalOem) * 100)}%)
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
          <div className="mt-6 flex gap-3 print:hidden">
            <button onClick={() => window.print()} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
              Print / PDF
            </button>
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

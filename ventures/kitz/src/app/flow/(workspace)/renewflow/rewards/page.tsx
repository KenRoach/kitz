"use client";

import { useState } from "react";

const TIERS = [
  { name: "Bronze", min: 0, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Silver", min: 500, color: "bg-gray-200 text-gray-700 border-gray-300" },
  { name: "Gold", min: 2000, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { name: "Platinum", min: 5000, color: "bg-purple-100 text-purple-700 border-purple-200" },
];

function getTier(points: number) {
  return [...TIERS].reverse().find((t) => points >= t.min) || TIERS[0];
}

const PTS_TO_USD = 0.01; // 100 pts = $1

const ACTIVITY = [
  { id: 1, date: "2026-03-21", type: "renewal", desc: "Grupo Alfa — 3x HP EliteDesk 800 G9 (QTE-001)", points: 33, balance: 1240 },
  { id: 2, date: "2026-03-19", type: "referral", desc: "Referred Beta Investments — client converted", points: 250, balance: 1207 },
  { id: 3, date: "2026-03-18", type: "renewal", desc: "Rex Distribution — 5x HP EliteBook 840 G10 (QTE-002)", points: 60, balance: 957 },
  { id: 4, date: "2026-03-15", type: "renewal", desc: "Modern Arch — 1x Dell Precision 5680 (QTE-003)", points: 23, balance: 897 },
  { id: 5, date: "2026-03-12", type: "referral", desc: "Referred TechSoluciones — client converted", points: 250, balance: 874 },
  { id: 6, date: "2026-03-10", type: "renewal", desc: "Café Central — 2x Lenovo ThinkPad T14 (PO-001)", points: 20, balance: 624 },
  { id: 7, date: "2026-03-05", type: "redeem", desc: "Credit applied to PO-001", points: -200, balance: 604 },
  { id: 8, date: "2026-03-01", type: "renewal", desc: "Grupo Alfa — 8x Dell OptiPlex 7010 (QTE-004)", points: 63, balance: 804 },
  { id: 9, date: "2026-02-20", type: "referral", desc: "Referred Café Central — client converted", points: 250, balance: 741 },
  { id: 10, date: "2026-02-15", type: "renewal", desc: "Grupo Alfa — 4x HP ProDesk 400 G9 (QTE-005)", points: 38, balance: 491 },
];

const REFERRALS = [
  { id: 1, client: "Beta Investments", status: "converted", date: "2026-03-17", points: 250 },
  { id: 2, client: "TechSoluciones", status: "converted", date: "2026-03-10", points: 250 },
  { id: 3, client: "Café Central", status: "converted", date: "2026-02-18", points: 250 },
  { id: 4, client: "Logística del Sur", status: "pending", date: "2026-03-20", points: 0 },
  { id: 5, client: "GreenTech PA", status: "pending", date: "2026-03-22", points: 0 },
];

const typeStyles: Record<string, { label: string; color: string }> = {
  renewal: { label: "Renewal", color: "bg-blue-100 text-blue-700" },
  referral: { label: "Referral", color: "bg-green-100 text-green-700" },
  redeem: { label: "Redeemed", color: "bg-red-100 text-red-700" },
};

const refStatusStyles: Record<string, string> = {
  converted: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function RewardsPage() {
  const [tab, setTab] = useState<"activity" | "referrals">("activity");
  const [copied, setCopied] = useState(false);

  const totalPoints = 1240;
  const credit = totalPoints * PTS_TO_USD;
  const tier = getTier(totalPoints);
  const nextTier = TIERS.find((t) => t.min > totalPoints);
  const refLink = "https://renewflow.io/r/grupo-alfa-rf2026";

  function copyLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500">Earn points on renewals and referrals. Redeem as USD credit on purchase orders.</p>
      </div>

      {/* Balance + Credit + Tier */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Points Balance</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{totalPoints.toLocaleString()}</p>
          <p className="mt-1 text-xs text-gray-500">100 pts = $1.00 USD</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Credit Available</p>
          <p className="mt-1 text-3xl font-bold text-green-700">${credit.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-500">Apply to any purchase order</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-400">Current Tier</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-bold ${tier.color}`}>{tier.name}</span>
          </div>
          {nextTier && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{totalPoints} pts</span>
                <span>{nextTier.name} at {nextTier.min.toLocaleString()}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${Math.min(100, (totalPoints / nextTier.min) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">{(nextTier.min - totalPoints).toLocaleString()} pts to {nextTier.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* How you earn */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <p className="text-sm font-semibold text-purple-800">How you earn</p>
        <div className="mt-2 flex flex-wrap gap-6 text-xs text-purple-700">
          <span><strong>Renewals:</strong> 10 pts per $100 quoted</span>
          <span><strong>Referrals:</strong> 250 pts per converted client</span>
          <span><strong>Redeem:</strong> 100 pts = $1 credit on POs</span>
        </div>
      </div>

      {/* Referral link */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Your Referral Link</p>
        <p className="mt-1 text-xs text-gray-500">Share this link — earn 250 points when a referred client closes their first renewal.</p>
        <div className="mt-3 flex items-center gap-2">
          <input readOnly value={refLink} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 font-mono" />
          <button
            onClick={copyLink}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${copied ? "bg-green-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab("activity")} className={`px-4 py-2 text-sm font-semibold transition border-b-2 ${tab === "activity" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Activity Log
        </button>
        <button onClick={() => setTab("referrals")} className={`px-4 py-2 text-sm font-semibold transition border-b-2 ${tab === "referrals" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          Referrals ({REFERRALS.length})
        </button>
      </div>

      {/* Activity log */}
      {tab === "activity" && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 pl-4">Date</th>
                <th className="py-3">Type</th>
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Points</th>
                <th className="py-3 text-right pr-4">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVITY.map((a) => {
                const s = typeStyles[a.type];
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pl-4 text-gray-500 whitespace-nowrap">{a.date}</td>
                    <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.color}`}>{s.label}</span></td>
                    <td className="py-3 text-gray-700">{a.desc}</td>
                    <td className={`py-3 text-right font-semibold ${a.points >= 0 ? "text-green-700" : "text-red-600"}`}>{a.points >= 0 ? "+" : ""}{a.points}</td>
                    <td className="py-3 text-right pr-4 text-gray-500">{a.balance.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Referrals tab */}
      {tab === "referrals" && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 pl-4">Referred Client</th>
                <th className="py-3">Date Referred</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right pr-4">Points Earned</th>
              </tr>
            </thead>
            <tbody>
              {REFERRALS.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pl-4 font-medium text-gray-900">{r.client}</td>
                  <td className="py-3 text-gray-500">{r.date}</td>
                  <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${refStatusStyles[r.status]}`}>{r.status}</span></td>
                  <td className="py-3 text-right pr-4 font-semibold text-gray-900">{r.points > 0 ? `+${r.points}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

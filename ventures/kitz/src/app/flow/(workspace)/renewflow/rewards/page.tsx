"use client";

const PARTNERS = [
  { name: "Grupo Alfa", points: 1240, level: "Gold", renewals: 8 },
  { name: "Rex Distribution", points: 680, level: "Silver", renewals: 4 },
  { name: "Modern Arch", points: 320, level: "Bronze", renewals: 2 },
  { name: "Café Central", points: 150, level: "Bronze", renewals: 1 },
];

const levelStyles: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-700",
  Silver: "bg-gray-200 text-gray-700",
  Bronze: "bg-orange-100 text-orange-700",
};

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
        <p className="text-gray-500">Partner rewards and incentive program</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <th className="py-3 pl-4">Partner</th>
              <th className="py-3">Level</th>
              <th className="py-3">Points</th>
              <th className="py-3">Renewals</th>
            </tr>
          </thead>
          <tbody>
            {PARTNERS.map((p) => (
              <tr key={p.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pl-4 font-medium text-gray-900">{p.name}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${levelStyles[p.level]}`}>{p.level}</span>
                </td>
                <td className="py-3 font-semibold text-gray-900">{p.points.toLocaleString()}</td>
                <td className="py-3 text-gray-600">{p.renewals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

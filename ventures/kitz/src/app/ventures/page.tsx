import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

const VENTURES = [
  {
    id: "1",
    name: "KitZ",
    slug: "kitz",
    description: "The factory itself — admin, venture management, analytics",
    status: "active" as const,
  },
  {
    id: "2",
    name: "Flow",
    slug: "renewflow",
    description: "AI warranty renewal platform for LATAM IT channel partners (product: RenewFlow)",
    status: "active" as const,
  },
];

export default function VenturesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventures</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage portfolio companies launched from the factory
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New Venture
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {VENTURES.map((v) => (
          <Link
            key={v.id}
            href={`/ventures/${v.slug}`}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {v.name}
                </h2>
                <StatusBadge status={v.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">{v.description}</p>
            </div>
            <span className="text-xs text-gray-400">{v.slug}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

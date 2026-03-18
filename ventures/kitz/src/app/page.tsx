import { MetricCard } from "@/components/ui/metric-card";
import { ventures, skills, contacts, deals } from "@/lib/services";
import type { Venture, Skill } from "@/types";

export default async function DashboardPage() {
  let ventureList: Venture[] = [];
  let skillList: Skill[] = [];
  let contactCount = 0;
  let dealCount = 0;

  try {
    ventureList = await ventures.list();
  } catch {
    // factory-api may be unreachable during dev
  }

  try {
    skillList = await skills.list();
  } catch {
    // factory-api may be unreachable during dev
  }

  const firstVenture = ventureList[0];

  if (firstVenture) {
    try {
      const contactList = await contacts.list(firstVenture.id);
      contactCount = contactList.length;
    } catch {
      // contact-engine may be unreachable during dev
    }

    try {
      const dealList = await deals.list(firstVenture.id);
      dealCount = dealList.length;
    } catch {
      // contact-engine may be unreachable during dev
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Factory-wide overview across all ventures
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Ventures"
          value={ventureList.length}
          subtitle={
            ventureList.length > 0
              ? ventureList.map((v) => v.name).join(", ")
              : "No ventures yet"
          }
        />
        <MetricCard
          label="Skills"
          value={skillList.length}
          subtitle="Across all ventures"
        />
        <MetricCard
          label="Contacts"
          value={contactCount}
          subtitle={firstVenture ? `In ${firstVenture.name}` : "No ventures yet"}
        />
        <MetricCard
          label="Deals"
          value={dealCount}
          subtitle={firstVenture ? `In ${firstVenture.name}` : "No ventures yet"}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Agent Activity
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            No agent executions yet. Deploy a skill to get started.
          </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Deal Pipeline
          </h2>
          {dealCount > 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              {dealCount} active deal{dealCount !== 1 ? "s" : ""} in pipeline.
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              No active deals. Create contacts and deals from a venture.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

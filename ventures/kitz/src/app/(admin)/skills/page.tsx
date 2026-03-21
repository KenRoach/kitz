import { StatusBadge } from "@/components/ui/status-badge";
import { skills, ventures } from "@/lib/services";

export default async function SkillsPage() {
  const [allSkills, allVentures] = await Promise.all([
    skills.list(),
    ventures.list(),
  ]);

  const ventureMap = new Map(allVentures.map((v) => [v.id, v.name]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI prompt templates with structured input/output schemas
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New Skill
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 font-medium text-gray-600">Venture</th>
              <th className="px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allSkills.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {s.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {s.slug}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {ventureMap.get(s.ventureId) ?? s.ventureId}
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                  {s.description ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.isActive ? "active" : "paused"} />
                </td>
                <td className="px-4 py-3">
                  <span className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                    Test
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

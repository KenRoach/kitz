import { StatusBadge } from "@/components/ui/status-badge";

const SKILLS = [
  { name: "Sales Outreach", slug: "sales", venture: "KitZ" },
  { name: "Onboarding", slug: "onboarding", venture: "KitZ" },
  { name: "Retention", slug: "retention", venture: "KitZ" },
  { name: "Content", slug: "content", venture: "KitZ" },
  { name: "TPM Quote", slug: "tpm-quote", venture: "Flow (RenewFlow)" },
  { name: "OEM Quote", slug: "oem-quote", venture: "Flow (RenewFlow)" },
  { name: "Renewal Alert", slug: "renewal-alert", venture: "Flow (RenewFlow)" },
];

export default function SkillsPage() {
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
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {SKILLS.map((s) => (
              <tr
                key={s.slug}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {s.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {s.slug}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.venture}</td>
                <td className="px-4 py-3">
                  <StatusBadge status="active" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

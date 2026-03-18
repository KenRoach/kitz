import { StatusBadge } from "@/components/ui/status-badge";

export default function AgentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI agents that execute skills on behalf of ventures
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New Agent
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Venture</th>
              <th className="px-4 py-3 font-medium text-gray-600">Skills</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                No agents configured yet. Create one to start automating.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Audit trail of all skill executions across ventures
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="px-4 py-3 font-medium text-gray-600">Venture</th>
              <th className="px-4 py-3 font-medium text-gray-600">Skill</th>
              <th className="px-4 py-3 font-medium text-gray-600">Latency</th>
              <th className="px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                No agent executions recorded yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

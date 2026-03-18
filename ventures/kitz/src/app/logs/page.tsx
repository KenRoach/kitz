import { ventures, agentLogs } from "@/lib/services";
import type { AgentLog } from "@/types";

interface LogsPageProps {
  searchParams: { venture_id?: string };
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  let logs: AgentLog[] = [];
  let ventureId = searchParams.venture_id;

  if (!ventureId) {
    try {
      const ventureList = await ventures.list();
      if (ventureList.length > 0) {
        ventureId = ventureList[0].id;
      }
    } catch {
      // factory-api may be unreachable during dev
    }
  }

  if (ventureId) {
    try {
      logs = await agentLogs.list(ventureId);
    } catch {
      // factory-api may be unreachable during dev
    }
  }

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
              <th className="px-4 py-3 font-medium text-gray-600">Input Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No logs yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.ventureId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{log.skill}</td>
                  <td className="px-4 py-3 text-gray-600">{log.latencyMs}ms</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.inputHash.slice(0, 8)}…
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

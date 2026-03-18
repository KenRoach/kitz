import { ventures, agentLogs } from "@/lib/services";
import type { AgentLog, Venture } from "@/types";
import ActivityList from "./activity-list";

export default async function ActivityPage() {
  let logs: AgentLog[] = [];
  let error: string | null = null;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (!flow) {
      error = "Flow venture not found.";
    } else {
      try {
        const raw = await agentLogs.list(flow.id);
        // Newest first
        logs = [...raw].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } catch {
        logs = [];
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to connect to services";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Feed</h1>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <ActivityList logs={logs} />
    </div>
  );
}

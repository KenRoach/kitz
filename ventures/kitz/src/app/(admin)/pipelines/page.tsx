export default function PipelinesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="mt-1 text-sm text-gray-500">
            Multi-step automation workflows that chain skills together
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          New Pipeline
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-400">
          No pipelines defined yet. Create one to orchestrate multi-step
          automations across ventures.
        </p>
      </div>
    </div>
  );
}

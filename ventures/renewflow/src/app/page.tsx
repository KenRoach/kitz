export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Installed Base */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Installed Base
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">
            Track hardware and software assets with warranty expiration dates.
          </p>
        </div>
      </section>

      {/* Renewal Pipeline */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Renewal Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b">
              Identified
            </h3>
            <p className="text-sm text-gray-400">
              No renewals identified yet.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b">
              Quoted
            </h3>
            <p className="text-sm text-gray-400">No quotes pending.</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b">
              Closed
            </h3>
            <p className="text-sm text-gray-400">No closed renewals.</p>
          </div>
        </div>
      </section>

      {/* Quote Generator */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quote Generator
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">
            Generate renewal quotes for customers based on installed base data.
          </p>
        </div>
      </section>
    </div>
  );
}

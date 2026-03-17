import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Kitz - AI Business OS
        </h1>
        <p className="mt-2 text-gray-600">
          AI Business Operating System for LATAM SMBs
        </p>

        <nav className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/agents"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">Agents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage AI agents that automate your business workflows.
            </p>
          </Link>

          <Link
            href="/pipelines"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">Pipelines</h2>
            <p className="mt-1 text-sm text-gray-500">
              Build and monitor sales and operations pipelines.
            </p>
          </Link>

          <Link
            href="/contacts"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
            <p className="mt-1 text-sm text-gray-500">
              Organize and track your customers and leads.
            </p>
          </Link>
        </nav>
      </div>
    </main>
  );
}

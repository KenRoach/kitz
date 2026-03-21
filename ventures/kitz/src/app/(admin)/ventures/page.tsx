import Link from "next/link";
import { revalidatePath } from "next/cache";
import { StatusBadge } from "@/components/ui/status-badge";
import { ventures } from "@/lib/services";

async function createVenture(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  await ventures.create({ name, slug, description });
  revalidatePath("/ventures");
}

export default async function VenturesPage() {
  const ventureList = await ventures.list();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventures</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage portfolio companies launched from the factory
          </p>
        </div>
      </div>

      {/* Create venture form */}
      <form
        action={createVenture}
        className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5"
      >
        <h2 className="mb-3 text-sm font-semibold text-gray-700">New Venture</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <input
            name="slug"
            required
            placeholder="Slug (e.g. my-venture)"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <input
            name="description"
            placeholder="Description"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Venture
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {ventureList.map((v) => {
          async function deleteVenture() {
            "use server";
            await ventures.delete(v.id);
            revalidatePath("/ventures");
          }

          return (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-sm"
            >
              <Link href={`/ventures/${v.slug}`} className="flex-1">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {v.name}
                    </h2>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{v.description}</p>
                </div>
              </Link>
              <div className="ml-4 flex items-center gap-4">
                <span className="text-xs text-gray-400">{v.slug}</span>
                <form action={deleteVenture}>
                  <button
                    type="submit"
                    className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

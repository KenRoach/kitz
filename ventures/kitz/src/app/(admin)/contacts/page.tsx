import Link from "next/link";
import { revalidatePath } from "next/cache";
import { contacts, ventures } from "@/lib/services";

async function createContact(formData: FormData) {
  "use server";
  const ventureId = formData.get("ventureId") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const company = formData.get("company") as string | null;
  await contacts.create({
    ventureId,
    firstName,
    lastName,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(company ? { company } : {}),
  });
  revalidatePath("/contacts");
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: { venture_id?: string };
}) {
  const ventureList = await ventures.list();
  const ventureId =
    searchParams?.venture_id || ventureList[0]?.id || "";
  const contactList = ventureId ? await contacts.list(ventureId) : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cross-venture CRM — contacts scoped per venture
          </p>
        </div>
      </div>

      {/* Venture selector */}
      {ventureList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {ventureList.map((v) => (
            <Link
              key={v.id}
              href={`/contacts?venture_id=${v.id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                ventureId === v.id
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {v.name}
            </Link>
          ))}
        </div>
      )}

      {/* Create contact form */}
      {ventureId && (
        <form
          action={createContact}
          className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5"
        >
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            New Contact
          </h2>
          <input type="hidden" name="ventureId" value={ventureId} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              name="firstName"
              required
              placeholder="First name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="lastName"
              required
              placeholder="Last name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <input
              name="company"
              placeholder="Company"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Contact
          </button>
        </form>
      )}

      {/* Contacts table */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="px-4 py-3 font-medium text-gray-600">Company</th>
            </tr>
          </thead>
          <tbody>
            {contactList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No contacts yet. Add contacts manually or via import.
                </td>
              </tr>
            ) : (
              contactList.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.phone ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.company ?? <span className="text-gray-300">—</span>}
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

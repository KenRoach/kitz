import { ventures, assets } from "@/lib/services";
import type { Asset, Venture } from "@/types";
import QuoterClient from "./quoter-client";

export default async function QuoterPage() {
  let assetList: Asset[] = [];
  let error: string | null = null;

  try {
    const allVentures: Venture[] = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");
    if (flow) {
      assetList = await assets.list(flow.id);
    } else {
      error = "Flow venture not found. Please create it in KitZ first.";
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load assets";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quote Generator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select assets and generate a smart TPM quote
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <QuoterClient assets={assetList} />
      )}
    </div>
  );
}

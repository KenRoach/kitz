import { NextRequest, NextResponse } from "next/server";
import { ventures, assets } from "@/lib/services";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assetData = body.assets;

    if (!Array.isArray(assetData) || assetData.length === 0) {
      return NextResponse.json({ error: "No assets provided" }, { status: 400 });
    }

    // Find the Flow venture
    const allVentures = await ventures.list();
    const flow = allVentures.find((v) => v.slug === "renewflow");

    if (!flow) {
      return NextResponse.json({ error: "Flow venture not found" }, { status: 404 });
    }

    const result = await assets.bulkImport(flow.id, assetData);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, createUserClient, requireOrgType } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";

export const GET = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var", "operator");

  const client = createUserClient(user.accessToken);

  const { data: assets, error } = await client.from("asset_item").select("*");
  if (error) throw error;

  const items = (assets ?? []).map((a: Record<string, unknown>) => {
    const diffMs = new Date(a.warranty_end as string).getTime() - Date.now();
    return { ...a, daysLeft: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
  });

  // Client concentration
  const clientCounts: Record<string, number> = {};
  items.forEach((a) => {
    clientCounts[a.client as string] = (clientCounts[a.client as string] || 0) + 1;
  });
  const clientConcentration = Object.entries(clientCounts)
    .map(([client, count]) => ({ client, count, pct: Math.round((count / items.length) * 100) }))
    .sort((a, b) => b.count - a.count);

  // Expiry heatmap
  const buckets = { lapsed: 0, critical_7d: 0, urgent_14d: 0, warning_30d: 0, attention_60d: 0, healthy_90d: 0 };
  items.forEach((a) => {
    const d = a.daysLeft as number;
    if (d < 0) buckets.lapsed++;
    else if (d <= 7) buckets.critical_7d++;
    else if (d <= 14) buckets.urgent_14d++;
    else if (d <= 30) buckets.warning_30d++;
    else if (d <= 60) buckets.attention_60d++;
    else if (d <= 90) buckets.healthy_90d++;
  });

  // Tier distribution
  const tierCounts: Record<string, number> = {};
  items.forEach((a) => {
    tierCounts[a.tier as string] = (tierCounts[a.tier as string] || 0) + 1;
  });
  const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
    tier,
    count,
    pct: Math.round((count / items.length) * 100),
  }));

  return NextResponse.json({
    totalDevices: items.length,
    clientConcentration,
    expiryHeatmap: buckets,
    tierDistribution,
  });
});

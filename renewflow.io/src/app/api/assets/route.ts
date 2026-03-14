import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, createUserClient, requireOrgType } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";

const listQuery = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
  tier: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
});

function addDaysLeft(asset: Record<string, unknown>) {
  if (!asset?.warranty_end) return asset;
  const diffMs = new Date(asset.warranty_end as string).getTime() - Date.now();
  return { ...asset, daysLeft: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
}

export const GET = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var", "operator");

  const url = new URL(req.url);
  const params = listQuery.parse(Object.fromEntries(url.searchParams));
  const client = createUserClient(user.accessToken);

  let query = client.from("asset_item").select("*");
  if (params.status) query = query.eq("status", params.status);
  if (params.tier) query = query.eq("tier", params.tier);
  if (params.brand) query = query.ilike("brand", `%${params.brand}%`);
  if (params.search) query = query.or(`serial.ilike.%${params.search}%,model.ilike.%${params.search}%`);
  query = query.order("created_at", { ascending: false });
  if (params.cursor) query = query.lt("id", params.cursor);

  const limit = params.limit;
  const { data, error } = await query.limit(limit + 1);
  if (error) throw error;

  const items = data ?? [];
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return NextResponse.json({
    data: result.map(addDaysLeft),
    nextCursor: hasMore ? result[result.length - 1].id : null,
    hasMore,
  });
});

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, createUserClient } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";

const listQuery = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export const GET = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  const client = createUserClient(user.accessToken);

  const url = new URL(req.url);
  const params = listQuery.parse(Object.fromEntries(url.searchParams));

  let query = client.from("support_ticket").select("*");
  if (params.status) query = query.eq("status", params.status);
  if (params.priority) query = query.eq("priority", params.priority);
  query = query.order("created_at", { ascending: false });
  if (params.cursor) query = query.lt("id", params.cursor);

  const limit = params.limit;
  const { data, error } = await query.limit(limit + 1);
  if (error) throw error;

  const items = data ?? [];
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return NextResponse.json({ data: result, nextCursor: hasMore ? result[result.length - 1].id : null, hasMore });
});

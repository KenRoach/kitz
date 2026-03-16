import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, createUserClient, requireOrgType } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";

const listQuery = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.string().optional(),
});

const createSchema = z.object({
  quoteId: z.string().uuid(),
});

export const GET = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var", "operator", "delivery_partner");

  const url = new URL(req.url);
  const params = listQuery.parse(Object.fromEntries(url.searchParams));
  const client = createUserClient(user.accessToken);

  let query = client.from("order").select("*, order_item(*)");
  if (params.status) query = query.eq("status", params.status);
  query = query.order("created_at", { ascending: false });
  if (params.cursor) query = query.lt("id", params.cursor);

  const limit = params.limit;
  const { data, error } = await query.limit(limit + 1);
  if (error) throw error;

  const items = data ?? [];
  const hasMore = items.length > limit;
  const result = hasMore ? items.slice(0, limit) : items;

  return NextResponse.json({
    data: result,
    nextCursor: hasMore ? result[result.length - 1].id : null,
    hasMore,
  });
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var");

  const body = createSchema.parse(await req.json());
  const client = createUserClient(user.accessToken);

  // Get quote to create order from
  const { data: quote, error: quoteError } = await client
    .from("quote")
    .select("*, quote_item(*)")
    .eq("id", body.quoteId)
    .single();
  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Create order
  const { data: order, error: orderError } = await client
    .from("order")
    .insert({
      org_id: user.orgId,
      quote_id: quote.id,
      created_by: user.id,
      status: "submitted",
      total: quote.total,
    })
    .select()
    .single();
  if (orderError) throw orderError;

  // Create order items from quote items
  if (quote.quote_item?.length) {
    const orderItems = quote.quote_item.map((qi: Record<string, unknown>) => ({
      order_id: order.id,
      asset_id: qi.asset_id,
      coverage_type: qi.coverage_type,
      price: qi.price,
    }));
    await client.from("order_item").insert(orderItems);
  }

  // Log state transition
  await client.from("order_state_transition").insert({
    order_id: order.id,
    from_status: null,
    to_status: "submitted",
    changed_by: user.id,
  });

  return NextResponse.json(order, { status: 201 });
});

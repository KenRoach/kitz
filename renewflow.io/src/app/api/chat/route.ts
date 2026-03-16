import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser, requireOrgType } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";
import { aiChat } from "@/lib/kitz-client";

const chatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
  system: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const user = await getAuthUser(req);
  requireOrgType(user, "var", "operator");

  const body = chatSchema.parse(await req.json());

  // Route through KitZ OS for AI intelligence
  const result = await aiChat(
    body.messages.map((m) => ({ role: m.role, text: m.content })),
    body.messages[body.messages.length - 1]?.content ?? "",
    body.context,
  );

  return NextResponse.json({ content: result.response });
});

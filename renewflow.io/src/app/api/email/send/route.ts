import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-response";
import { sendEmail } from "@/lib/resend";

const schema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  text: z.string().min(1),
  html: z.string().optional(),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  await getAuthUser(req); // ensure authenticated
  const body = schema.parse(await req.json());
  const result = await sendEmail(body.to, body.subject, body.text, body.html);
  return NextResponse.json(result);
});

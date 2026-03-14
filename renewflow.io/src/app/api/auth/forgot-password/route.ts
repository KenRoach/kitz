import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase";
import { withErrorHandler } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

const schema = z.object({ email: z.string().email() });

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const { email } = schema.parse(await req.json());
  const admin = createAdminClient();

  const { error } = await admin.auth.resetPasswordForEmail(email);
  if (error) throw new BadRequestError(error.message);

  return NextResponse.json({ message: "Password reset email sent" });
});

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase";
import { withErrorHandler } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

const schema = z.object({ email: z.string().email() });

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const { email } = schema.parse(await req.json());

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new BadRequestError("Email service is not configured. Please contact support.");
  }

  const admin = createAdminClient();

  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.renewflow.io"}/login?reset-token=`,
  });
  if (error) {
    // Map Supabase errors to user-friendly messages
    if (error.message.includes("session") || error.message.includes("expired")) {
      throw new BadRequestError("Service temporarily unavailable. Please try again in a moment.");
    }
    throw new BadRequestError(error.message);
  }

  return NextResponse.json({ message: "Password reset email sent" });
});

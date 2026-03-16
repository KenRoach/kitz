import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase";
import { withErrorHandler } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

const schema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const { token, password } = schema.parse(await req.json());
  const admin = createAdminClient();

  // Verify the token and update the password
  const { data: tokenData, error: verifyError } = await admin.auth.verifyOtp({
    token_hash: token,
    type: "recovery",
  });

  if (verifyError || !tokenData?.user) {
    throw new BadRequestError("Reset link is invalid or has expired. Please request a new one.");
  }

  // Update the user's password
  const { error: updateError } = await admin.auth.admin.updateUserById(
    tokenData.user.id,
    { password },
  );

  if (updateError) {
    throw new BadRequestError(updateError.message);
  }

  return NextResponse.json({ success: true, message: "Password has been reset successfully" });
});

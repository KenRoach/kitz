import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

// Always returns success — never reveal whether an email exists (security best practice)
export async function POST(request: NextRequest) {
  try {
    const { email } = schema.parse(await request.json());

    // Attempt Supabase password reset if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const { createAdminClient } = await import("@/lib/supabase");
        const admin = createAdminClient();
        await admin.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.renewflow.io"}/login?reset-token=`,
        });
      } catch (err) {
        // Log but don't expose Supabase errors to the client
        console.error("[forgot-password] Supabase error:", err);
      }
    }

    // Always return success
    return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Please enter a valid email address." },
      { status: 400 },
    );
  }
}

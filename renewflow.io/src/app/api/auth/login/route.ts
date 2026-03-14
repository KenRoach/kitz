import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase";
import { withErrorHandler } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const body = loginSchema.parse(await req.json());
  const admin = createAdminClient();

  const { data, error } = await admin.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error) throw new BadRequestError("Invalid email or password");

  const { data: profile } = await admin
    .from("core_user")
    .select("org_id, role, full_name, core_organization!inner(name, type)")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email!, fullName: profile?.full_name, role: profile?.role },
    org: {
      id: profile?.org_id,
      name: (profile as Record<string, unknown>)?.core_organization
        ? ((profile as Record<string, unknown>).core_organization as Record<string, string>).name
        : undefined,
      type: (profile as Record<string, unknown>)?.core_organization
        ? ((profile as Record<string, unknown>).core_organization as Record<string, string>).type
        : undefined,
    },
    session: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token },
  });
});

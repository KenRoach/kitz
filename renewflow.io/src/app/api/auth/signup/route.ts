import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase";
import { withErrorHandler } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  orgName: z.string().min(1),
  orgType: z.enum(["var", "delivery_partner"]),
  country: z.string().optional(),
});

export const POST = withErrorHandler(async (request: unknown) => {
  const req = request as NextRequest;
  const body = signupSchema.parse(await req.json());
  const admin = createAdminClient();

  const { data: org, error: orgError } = await admin
    .from("core_organization")
    .insert({ name: body.orgName, type: body.orgType, country: body.country ?? null })
    .select()
    .single();
  if (orgError) throw new BadRequestError(`Failed to create organization: ${orgError.message}`);

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { org_id: org.id, full_name: body.fullName },
  });
  if (authError) {
    await admin.from("core_organization").delete().eq("id", org.id);
    throw new BadRequestError(`Failed to create user: ${authError.message}`);
  }

  const { error: profileError } = await admin
    .from("core_user")
    .insert({ id: authData.user.id, org_id: org.id, email: body.email, full_name: body.fullName, role: "admin" });
  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("core_organization").delete().eq("id", org.id);
    throw new BadRequestError(`Failed to create profile: ${profileError.message}`);
  }

  const { data: session, error: signInError } = await admin.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (signInError) throw new BadRequestError("Account created but login failed");

  return NextResponse.json(
    {
      user: { id: authData.user.id, email: body.email, fullName: body.fullName },
      org: { id: org.id, name: org.name, type: org.type },
      session: { accessToken: session.session!.access_token, refreshToken: session.session!.refresh_token },
    },
    { status: 201 },
  );
});

import { NextRequest } from "next/server";
import { createAdminClient } from "./supabase";
import { ForbiddenError } from "./errors";

export interface AuthUser {
  id: string;
  orgId: string;
  orgType: string;
  role: string;
  email: string;
  accessToken: string;
}

/**
 * Extract and validate auth from request headers.
 * Returns the authenticated user or throws ForbiddenError.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ForbiddenError("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const admin = createAdminClient();

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user) {
    throw new ForbiddenError("Invalid or expired token");
  }

  const { data: profile } = await admin
    .from("core_user")
    .select("org_id, role, core_organization!inner(type)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    throw new ForbiddenError("User profile not found");
  }

  return {
    id: user.id,
    orgId: profile.org_id,
    orgType: (profile as Record<string, unknown>).core_organization
      ? ((profile as Record<string, unknown>).core_organization as Record<string, string>).type
      : "var",
    role: profile.role,
    email: user.email!,
    accessToken: token,
  };
}

/**
 * Create a Supabase client scoped to the user's access token.
 */
export function createUserClient(accessToken: string) {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

type OrgType = "var" | "operator" | "delivery_partner";

export function requireOrgType(user: AuthUser, ...allowed: OrgType[]) {
  if (!allowed.includes(user.orgType as OrgType)) {
    throw new ForbiddenError(`Access denied for org type '${user.orgType}'`);
  }
}

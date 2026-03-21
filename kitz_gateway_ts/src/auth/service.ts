/** Authentication service — Supabase Auth based. */

import { getSupabase } from "../db/client.js";

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export async function initDefaultAdmin(): Promise<void> {
  // No-op: admin users are managed via Supabase Auth
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; username: string; role: string }> {
  const db = getSupabase();
  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error || !data.session) throw new Error("Invalid credentials");

  // Look up role from core_user
  const { data: coreUser } = await db
    .from("core_user")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  // Fallback to user_metadata from Supabase Auth
  const meta = data.user.user_metadata as Record<string, string> | undefined;

  return {
    token: data.session.access_token,
    username: coreUser?.full_name || meta?.full_name || data.user.email || email,
    role: coreUser?.role || meta?.role || "member",
  };
}

export async function validateToken(token: string): Promise<AuthUser | null> {
  const db = getSupabase();
  const { data, error } = await db.auth.getUser(token);

  if (error || !data.user) return null;

  const { data: coreUser } = await db
    .from("core_user")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  return {
    id: data.user.id,
    username: coreUser?.full_name || data.user.email || "",
    role: coreUser?.role || "member",
  };
}

export async function registerUser(
  email: string,
  password: string,
  role = "member"
): Promise<{ username: string; role: string }> {
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const db = getSupabase();

  // Find a default org for self-registration
  const { data: orgs } = await db.from("core_org").select("id").limit(1).single();
  if (!orgs) throw new Error("Registration not available");

  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { org_id: orgs.id, role },
  });

  if (error) throw new Error(error.message);

  return { username: data.user.email || email, role };
}

export async function registerVar(
  email: string,
  password: string,
  companyName: string
): Promise<{ username: string; role: string; org_id: string }> {
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  if (!companyName.trim()) throw new Error("Company name is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");

  const db = getSupabase();

  // Create org for this VAR
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: org, error: orgErr } = await db
    .from("core_org")
    .insert({ name: companyName.trim(), slug })
    .select()
    .single();
  if (orgErr) throw new Error(`Failed to create organization: ${orgErr.message}`);

  // Create Supabase Auth user with org_id in metadata
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { org_id: org.id, role: "var", full_name: companyName.trim() },
  });
  if (error) {
    // Clean up org if user creation fails
    await db.from("core_org").delete().eq("id", org.id);
    throw new Error(error.message);
  }

  // Create core_user row (consistent with existing login/validateToken lookups)
  const { error: coreUserErr } = await db.from("core_user").insert({
    id: data.user.id,
    full_name: companyName.trim(),
    role: "var",
    org_id: org.id,
  });
  if (coreUserErr) {
    // Rollback auth user + org if core_user creation fails
    await db.auth.admin.deleteUser(data.user.id);
    await db.from("core_org").delete().eq("id", org.id);
    throw new Error(`Failed to create user profile: ${coreUserErr.message}`);
  }

  return { username: data.user.email || email, role: "var", org_id: org.id };
}

export async function resetPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<{ username: string; role: string }> {
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters");

  const db = getSupabase();

  // Verify current password
  const { error: loginErr } = await db.auth.signInWithPassword({ email, password: currentPassword });
  if (loginErr) throw new Error("Current password is incorrect");

  // Get user
  const { data: users } = await db.auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);
  if (!user) throw new Error("User not found");

  // Update password
  const { error } = await db.auth.admin.updateUserById(user.id, { password: newPassword });
  if (error) throw new Error("Failed to update password");

  const { data: coreUser } = await db.from("core_user").select("role, full_name").eq("id", user.id).single();

  const meta = user.user_metadata as Record<string, string> | undefined;

  return {
    username: coreUser?.full_name || meta?.full_name || user.email || email,
    role: coreUser?.role || meta?.role || "member",
  };
}

export async function forgotPassword(
  identifier: string,
  _baseUrl: string
): Promise<{ sent: boolean }> {
  const db = getSupabase();

  const redirectTo = "https://www.renewflow.io/reset-password";
  const { error } = await db.auth.resetPasswordForEmail(identifier, { redirectTo });

  if (error) {
    console.error("[auth] resetPasswordForEmail error:", error.message);
  }

  return { sent: true };
}

export async function resetPasswordWithToken(
  accessToken: string,
  newPassword: string
): Promise<{ email: string }> {
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");

  const db = getSupabase();

  const { data: userData, error: userError } = await db.auth.getUser(accessToken);
  if (userError || !userData.user) throw new Error("Invalid or expired reset link");

  const { error } = await db.auth.admin.updateUserById(userData.user.id, {
    password: newPassword,
  });

  if (error) throw new Error("Failed to update password: " + error.message);

  return { email: userData.user.email ?? "" };
}

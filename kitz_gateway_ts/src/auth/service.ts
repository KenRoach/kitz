/** Authentication service — bcrypt hashing, session tokens, password reset. */

import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { getSupabase } from "../db/client.js";

const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export async function initDefaultAdmin(): Promise<void> {
  const db = getSupabase();
  const { count } = await db.from("users").select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  const hash = await bcrypt.hash("admin", SALT_ROUNDS);
  await db.from("users").insert({ username: "admin", password_hash: hash, role: "admin" });
}

export async function login(username: string, password: string): Promise<{ token: string; username: string; role: string }> {
  const db = getSupabase();
  const { data: user, error } = await db
    .from("users")
    .select("id, username, password_hash, role")
    .eq("username", username)
    .single();

  if (error || !user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = randomBytes(32).toString("hex");
  await db.from("sessions").insert({ token, user_id: user.id });

  return { token, username: user.username, role: user.role };
}

export async function validateToken(token: string): Promise<AuthUser | null> {
  const db = getSupabase();
  const { data: session } = await db
    .from("sessions")
    .select("user_id")
    .eq("token", token)
    .single();

  if (!session) return null;

  const { data: user } = await db
    .from("users")
    .select("id, username, role")
    .eq("id", session.user_id)
    .single();

  return user ?? null;
}

export async function registerUser(
  username: string,
  password: string,
  role = "user"
): Promise<{ username: string; role: string }> {
  if (username.length < 3) throw new Error("Username must be at least 3 characters");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const db = getSupabase();

  const { data: existing } = await db.from("users").select("id").eq("username", username).single();
  if (existing) throw new Error("Username already taken");

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { error } = await db.from("users").insert({ username, password_hash: hash, role });
  if (error) throw new Error("Registration failed");

  return { username, role };
}

export async function resetPassword(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<{ username: string; role: string }> {
  if (newPassword.length < 8) throw new Error("New password must be at least 8 characters");

  const db = getSupabase();
  const { data: user } = await db
    .from("users")
    .select("id, username, password_hash, role")
    .eq("username", username)
    .single();

  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new Error("Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.from("users").update({ password_hash: hash }).eq("id", user.id);

  // Invalidate all sessions
  await db.from("sessions").delete().eq("user_id", user.id);

  return { username: user.username, role: user.role };
}

export async function forgotPassword(
  identifier: string,
  baseUrl: string
): Promise<{ sent: boolean }> {
  const db = getSupabase();

  // Use Supabase Auth's built-in password reset (handles email delivery)
  const redirectTo = `${baseUrl}/reset-password`;
  const { error } = await db.auth.resetPasswordForEmail(identifier, { redirectTo });

  if (error) {
    // Log but don't expose to client (prevent user enumeration)
    console.error("[auth] resetPasswordForEmail error:", error.message);
  }

  // Always return success to prevent user enumeration
  return { sent: true };
}

export async function resetPasswordWithToken(
  accessToken: string,
  newPassword: string
): Promise<{ email: string }> {
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");

  const { createClient } = await import("@supabase/supabase-js");
  const db = getSupabase();

  // Create a client authenticated with the user's access token
  const userClient = createClient(
    (db as unknown as { supabaseUrl: string }).supabaseUrl || process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  // Use admin API to decode the JWT and get the user ID
  const { data: userData, error: userError } = await db.auth.getUser(accessToken);
  if (userError || !userData.user) throw new Error("Invalid or expired reset link");

  // Update password via admin API
  const { error } = await db.auth.admin.updateUserById(userData.user.id, {
    password: newPassword,
  });

  if (error) throw new Error("Failed to update password: " + error.message);

  return { email: userData.user.email ?? "" };
}

/** Authentication service — bcrypt hashing, session tokens, password reset. */

import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { getSupabase } from "../db/client.js";
import { sendEmail, buildPasswordResetEmail, isConfigured } from "../services/mailer.js";

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

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function forgotPassword(
  identifier: string,
  baseUrl: string
): Promise<{ sent: boolean }> {
  if (!isConfigured()) throw new Error("Email service not configured");

  const db = getSupabase();

  // Look up user by email or username
  let user: { id: string; email: string | null; username: string } | null = null;
  const { data: byEmail } = await db
    .from("users")
    .select("id, email, username")
    .eq("email", identifier)
    .single();

  if (byEmail) {
    user = byEmail;
  } else {
    const { data: byUsername } = await db
      .from("users")
      .select("id, email, username")
      .eq("username", identifier)
      .single();
    if (byUsername) user = byUsername;
  }

  // Always return success to prevent user enumeration
  if (!user || !user.email) return { sent: true };

  // Invalidate any existing reset tokens for this user
  await db
    .from("password_reset_tokens")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("used", false);

  // Generate a secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  await db.from("password_reset_tokens").insert({
    token,
    user_id: user.id,
    expires_at: expiresAt,
  });

  // Build reset URL
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Send branded email
  const { subject, body, html } = buildPasswordResetEmail(resetUrl);
  await sendEmail(user.email, subject, body, html);

  return { sent: true };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ username: string; role: string }> {
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");

  const db = getSupabase();

  // Find valid token
  const { data: resetToken } = await db
    .from("password_reset_tokens")
    .select("user_id, expires_at, used")
    .eq("token", token)
    .single();

  if (!resetToken) throw new Error("Invalid or expired reset link");
  if (resetToken.used) throw new Error("This reset link has already been used");
  if (new Date(resetToken.expires_at) < new Date()) throw new Error("This reset link has expired");

  // Get user
  const { data: user } = await db
    .from("users")
    .select("id, username, role")
    .eq("id", resetToken.user_id)
    .single();

  if (!user) throw new Error("User not found");

  // Update password
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.from("users").update({ password_hash: hash }).eq("id", user.id);

  // Mark token as used
  await db.from("password_reset_tokens").update({ used: true }).eq("token", token);

  // Invalidate all sessions
  await db.from("sessions").delete().eq("user_id", user.id);

  return { username: user.username, role: user.role };
}

// ─── Auth Service ───
// Email/password authentication via RenewFlow's own API routes

import type { AuthTokenPayload, UserRole } from "@/types";

const API_BASE = "/api/auth";

export interface SignupParams {
  email: string;
  password: string;
  name: string;
  orgName?: string;
  orgType?: string;
  role?: UserRole;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

async function authRequest<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const err: AuthError = {
      code: data.error || "UNKNOWN",
      message: data.message || "An error occurred",
    };
    throw err;
  }

  return data as T;
}

export async function signup(params: SignupParams): Promise<AuthTokenPayload> {
  const result = await authRequest<{
    user: { id: string; email: string; fullName: string };
    org: { id: string; name: string; type: string };
    session: { accessToken: string; refreshToken: string };
  }>("/signup", {
    email: params.email,
    password: params.password,
    fullName: params.name,
    orgName: params.orgName || params.name,
    orgType: params.orgType || "var",
  });

  return {
    token: result.session.accessToken,
    userId: result.user.id,
    orgId: result.org.id,
    name: result.user.fullName,
    role: (result.org.type === "delivery_partner" ? "delivery-partner" : result.org.type) as UserRole,
    expiresIn: 3600,
  };
}

export async function login(params: LoginParams): Promise<AuthTokenPayload> {
  const result = await authRequest<{
    user: { id: string; email: string; fullName: string; role: string };
    org: { id: string; name: string; type: string };
    session: { accessToken: string; refreshToken: string };
  }>("/login", params);

  return {
    token: result.session.accessToken,
    userId: result.user.id,
    orgId: result.org.id,
    name: result.user.fullName || result.user.email,
    role: (result.org.type === "delivery_partner" ? "delivery-partner" : result.org.type || "var") as UserRole,
    expiresIn: 3600,
  };
}

export async function forgotPassword(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const result = await authRequest<{ message: string }>("/forgot-password", { email });
  return { success: true, message: result.message };
}

export async function validateResetToken(
  _token: string,
): Promise<{ valid: boolean; email?: string }> {
  // Supabase handles reset token validation via email link
  return { valid: true };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  return authRequest<{ success: boolean; message: string }>("/reset-password", { token, password });
}

import { apiFetch } from "./api-client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthOrg {
  id: string;
  name: string;
  type: "var" | "operator" | "delivery_partner";
}

export interface AuthSession {
  user: AuthUser;
  org: AuthOrg;
  session: { accessToken: string; refreshToken: string };
}

export interface MeResponse {
  user: AuthUser;
  org: AuthOrg;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    orgName: string;
    orgType: "var" | "delivery_partner";
    country?: string;
  }) =>
    apiFetch<AuthSession>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getMe: () => apiFetch<MeResponse>("/users/me"),
};

// ─── Auth Store ───
// Zustand store for authentication state (email/password via Kitz Gateway)
// Falls back to local-only auth when gateway is unreachable (frictionless demo)

import { create } from "zustand";
import type { AuthUser, UserRole } from "@/types";
import {
  signup as apiSignup,
  login as apiLogin,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  type SignupParams,
  type LoginParams,
  type AuthError,
} from "@/services/auth";

const TOKEN_KEY = "renewflow_token";
const USER_KEY = "renewflow_user";
const LOCAL_ACCOUNTS_KEY = "renewflow_local_accounts";

// ── Local auth fallback ──
// When the gateway is unreachable, auth works locally so users can
// sign up and log in without any backend dependency.

interface LocalAccount { email: string; password: string; name: string; role: UserRole; orgId: string }

function getLocalAccounts(): LocalAccount[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) || "[]"); } catch { return []; }
}

function saveLocalAccount(account: LocalAccount) {
  const accounts = getLocalAccounts().filter(a => a.email !== account.email);
  accounts.push(account);
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function makeLocalToken(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

type ResetState = "idle" | "sending" | "sent" | "resetting" | "success" | "error";

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  // Password reset
  resetState: ResetState;
  resetError: string | null;

  signup: (params: SignupParams) => Promise<void>;
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
  clearError: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearResetState: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  resetState: "idle" as ResetState,
  resetError: null,

  signup: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await apiSignup(params);
      const user: AuthUser = {
        id: result.userId,
        email: params.email,
        name: result.name,
        orgId: result.orgId,
        role: result.role || "var",
      };
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Also save locally so the user can log back in offline
      saveLocalAccount({ email: params.email, password: params.password, name: params.name, role: user.role, orgId: user.orgId });
      set({ user, token: result.token, loading: false, error: null });
    } catch {
      // Gateway unreachable — create account locally
      const existing = getLocalAccounts().find(a => a.email === params.email);
      if (existing) {
        set({ loading: false, error: "An account with this email already exists" });
        return;
      }
      const orgId = `org_${Date.now().toString(36)}`;
      const role: UserRole = params.role || "var";
      const token = makeLocalToken();
      const user: AuthUser = {
        id: `usr_${Date.now().toString(36)}`,
        email: params.email,
        name: params.name,
        orgId,
        role,
      };
      saveLocalAccount({ email: params.email, password: params.password, name: params.name, role, orgId });
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, loading: false, error: null });
    }
  },

  login: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await apiLogin(params);
      const user: AuthUser = {
        id: result.userId,
        email: params.email,
        name: result.name,
        orgId: result.orgId,
        role: result.role || "var",
      };
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token: result.token, loading: false, error: null });
    } catch {
      // Gateway unreachable — check local accounts
      const account = getLocalAccounts().find(a => a.email === params.email);
      if (!account || account.password !== params.password) {
        set({ loading: false, error: "Invalid email or password" });
        return;
      }
      const token = makeLocalToken();
      const user: AuthUser = {
        id: `usr_${account.email.replace(/[^a-z0-9]/gi, "")}`,
        email: account.email,
        name: account.name,
        orgId: account.orgId,
        role: account.role,
      };
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, loading: false, error: null });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, error: null });
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson) as AuthUser;
        // Ensure role is set (backward compat for existing sessions)
        const user: AuthUser = {
          ...parsed,
          role: parsed.role || ("var" as UserRole),
        };
        set({ user, token });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  },

  clearError: () => set({ error: null }),

  requestPasswordReset: async (email) => {
    set({ resetState: "sending", resetError: null });
    try {
      await apiForgotPassword(email);
      set({ resetState: "sent", resetError: null });
    } catch (err) {
      const authErr = err as AuthError;
      set({
        resetState: "error",
        resetError: authErr.message || "Failed to send reset email",
      });
    }
  },

  resetPassword: async (token, password) => {
    set({ resetState: "resetting", resetError: null });
    try {
      await apiResetPassword(token, password);
      set({ resetState: "success", resetError: null });
    } catch (err) {
      const authErr = err as AuthError;
      set({
        resetState: "error",
        resetError: authErr.message || "Failed to reset password",
      });
    }
  },

  clearResetState: () => set({ resetState: "idle", resetError: null }),
}));

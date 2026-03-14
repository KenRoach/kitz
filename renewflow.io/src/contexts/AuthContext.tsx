import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type AuthUser, type AuthOrg } from "@/services/auth.api";

interface AuthState {
  user: AuthUser | null;
  org: AuthOrg | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    orgName: string;
    orgType: "var" | "delivery_partner";
    country?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    org: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authApi
      .getMe()
      .then((data) => {
        setState({ user: data.user, org: data.org, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setState({ user: null, org: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem("access_token", data.session.accessToken);
    localStorage.setItem("refresh_token", data.session.refreshToken);
    setState({ user: data.user, org: data.org, isAuthenticated: true, isLoading: false });
  }, []);

  const signup = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      orgName: string;
      orgType: "var" | "delivery_partner";
      country?: string;
    }) => {
      const data = await authApi.signup(input);
      localStorage.setItem("access_token", data.session.accessToken);
      localStorage.setItem("refresh_token", data.session.refreshToken);
      setState({ user: data.user, org: data.org, isAuthenticated: true, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setState({ user: null, org: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

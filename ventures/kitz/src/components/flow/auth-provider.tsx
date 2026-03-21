"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  token: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuthState] = useState<AuthState>({ token: null, username: null });

  useEffect(() => {
    const token = localStorage.getItem("flow_token");
    const username = localStorage.getItem("flow_username");
    if (token) setAuthState({ token, username });
  }, []);

  const setAuth = useCallback((token: string, username: string) => {
    localStorage.setItem("flow_token", token);
    localStorage.setItem("flow_username", username);
    setAuthState({ token, username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("flow_token");
    localStorage.removeItem("flow_username");
    setAuthState({ token: null, username: null });
    router.push("/flow/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

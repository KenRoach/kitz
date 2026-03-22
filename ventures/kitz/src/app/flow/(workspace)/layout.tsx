"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { FlowShell } from "@/components/flow/flow-shell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token === null) {
      const stored = localStorage.getItem("flow_token");
      if (!stored) {
        router.push("/flow/login");
      }
    }
  }, [token, router]);

  if (!token && typeof window !== "undefined" && !localStorage.getItem("flow_token")) {
    return null;
  }

  return <FlowShell>{children}</FlowShell>;
}

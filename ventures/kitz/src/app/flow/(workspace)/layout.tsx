"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { FlowShell } from "@/components/flow/flow-shell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token === null) {
      const stored = localStorage.getItem("flow_token");
      if (!stored) {
        router.push("/flow/login");
      }
    }
    setChecking(false);
  }, [token, router]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />
      </div>
    );
  }

  if (!token && typeof window !== "undefined" && !localStorage.getItem("flow_token")) {
    return null;
  }

  return <FlowShell>{children}</FlowShell>;
}

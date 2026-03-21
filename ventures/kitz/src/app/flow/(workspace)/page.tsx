"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";

export default function FlowPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/flow/dashboard");
    } else {
      router.push("/flow/login");
    }
  }, [token, router]);

  return null;
}

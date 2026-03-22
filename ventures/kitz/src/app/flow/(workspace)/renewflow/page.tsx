"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FlowRenewFlowPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/flow/renewflow/dashboard");
  }, [router]);
  return null;
}

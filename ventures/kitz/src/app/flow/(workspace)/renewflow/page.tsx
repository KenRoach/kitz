"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { FlowShell } from "@/components/flow/flow-shell";

const RENEWFLOW_URL = process.env.NEXT_PUBLIC_RENEWFLOW_URL || "http://localhost:3000";

function RenewFlowContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePage, setActivePage] = useState(searchParams.get("page") || "dashboard");

  useEffect(() => {
    if (!token || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const sendToken = () => {
      iframe.contentWindow?.postMessage(
        { type: "rf_auth", token },
        RENEWFLOW_URL
      );
      const page = searchParams.get("page");
      if (page && page !== "dashboard") {
        iframe.contentWindow?.postMessage(
          { type: "rf_navigate", page },
          RENEWFLOW_URL
        );
      }
    };

    iframe.addEventListener("load", sendToken);
    return () => iframe.removeEventListener("load", sendToken);
  }, [token, searchParams]);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "rf_navigate", page },
      RENEWFLOW_URL
    );
  }, []);

  return (
    <FlowShell activePage={activePage} onNavigate={handleNavigate}>
      <div className="-m-6 h-[calc(100vh)] w-[calc(100%+3rem)]">
        <iframe
          ref={iframeRef}
          src={`${RENEWFLOW_URL}?embedded=1`}
          className="h-full w-full border-0"
          title="RenewFlow"
          allow="clipboard-write"
        />
      </div>
    </FlowShell>
  );
}

export default function FlowRenewFlowPage() {
  return (
    <Suspense fallback={null}>
      <RenewFlowContent />
    </Suspense>
  );
}

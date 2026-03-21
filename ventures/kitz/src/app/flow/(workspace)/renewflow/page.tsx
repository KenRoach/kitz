"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/flow/auth-provider";

const RENEWFLOW_URL = process.env.NEXT_PUBLIC_RENEWFLOW_URL || "http://localhost:3000";

export default function FlowRenewFlowPage() {
  const { token } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!token || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const sendToken = () => {
      iframe.contentWindow?.postMessage(
        { type: "rf_auth", token },
        RENEWFLOW_URL
      );
    };

    iframe.addEventListener("load", sendToken);
    return () => iframe.removeEventListener("load", sendToken);
  }, [token]);

  return (
    <div className="-m-6 h-[calc(100vh)] w-[calc(100%+3rem)]">
      <iframe
        ref={iframeRef}
        src={RENEWFLOW_URL}
        className="h-full w-full border-0"
        title="RenewFlow"
        allow="clipboard-write"
      />
    </div>
  );
}

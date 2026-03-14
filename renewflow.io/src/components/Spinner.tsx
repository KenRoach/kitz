"use client";

import type { CSSProperties } from "react";

export function Spinner({ size = 24, color = "#22c55e" }: { size?: number; color?: string }) {
  const style: CSSProperties = {
    width: size,
    height: size,
    border: `3px solid ${color}25`,
    borderTop: `3px solid ${color}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={style} />
    </>
  );
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
      <Spinner size={32} />
      <span style={{ fontSize: 14, color: "#94A3B8" }}>{message}</span>
    </div>
  );
}

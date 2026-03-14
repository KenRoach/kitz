"use client";

import { useEffect, useState, type FC, type ReactNode } from "react";

interface PageTransitionProps {
  pageKey: string;
  children: ReactNode;
}

export const PageTransition: FC<PageTransitionProps> = ({ pageKey, children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [pageKey]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}
    >
      {children}
    </div>
  );
};

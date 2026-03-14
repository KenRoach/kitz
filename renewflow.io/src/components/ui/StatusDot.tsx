"use client";

import type { FC } from "react";

interface StatusDotProps {
  color: string;
}

export const StatusDot: FC<StatusDotProps> = ({ color }) => (
  <span
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      display: "inline-block",
      boxShadow: `0 0 6px ${color}55`,
    }}
  />
);

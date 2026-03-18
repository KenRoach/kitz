"use client";

import { useState } from "react";
import type { AgentLog } from "@/types";

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ActivityRow({
  log,
  isEven,
}: {
  log: AgentLog;
  isEven: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className={`flex items-center gap-4 px-4 py-3 ${
          isEven ? "bg-white" : "bg-gray-50"
        }`}
      >
        {/* Timeline dot */}
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 mt-0.5" />

        {/* Timestamp */}
        <div className="w-36 flex-shrink-0">
          <span
            className="text-sm text-gray-500"
            title={new Date(log.createdAt).toLocaleString()}
          >
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>

        {/* Skill name */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate block">
            {log.skill}
          </span>
        </div>

        {/* Latency */}
        <div className="flex-shrink-0 w-16 text-right">
          <span className="text-xs font-mono text-gray-500">
            {formatLatency(log.latencyMs)}
          </span>
        </div>

        {/* View toggle */}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium w-10 text-right"
        >
          {expanded ? "Hide" : "View"}
        </button>
      </div>

      {/* Expanded JSON output */}
      {expanded && (
        <div
          className={`px-10 pb-3 ${isEven ? "bg-white" : "bg-gray-50"}`}
        >
          <pre className="text-xs text-gray-700 bg-gray-100 rounded-lg p-4 overflow-x-auto border border-gray-200 whitespace-pre-wrap break-all">
            {JSON.stringify(log.output, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}

export default function ActivityList({ logs }: { logs: AgentLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-400 text-sm">
          No activity yet. Run a skill to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="w-2 flex-shrink-0" />
        <div className="w-36 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Time
          </span>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Skill
          </span>
        </div>
        <div className="w-16 text-right flex-shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Latency
          </span>
        </div>
        <div className="w-10 flex-shrink-0" />
      </div>

      {/* Rows */}
      {logs.map((log, i) => (
        <ActivityRow key={log.id} log={log} isEven={i % 2 === 0} />
      ))}
    </div>
  );
}

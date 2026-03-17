/** RenewFlow warranty alert scheduler — runs daily at 7am UTC. */

import { runWarrantyAlerts } from "./jobs/warrantyAlerts.js";

const DAILY_MS = 24 * 60 * 60 * 1000;
let _interval: ReturnType<typeof setInterval> | null = null;

function msUntilNext7amUTC(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(7, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export function initWarrantyScheduler(): void {
  if (_interval) return;

  const delayMs = msUntilNext7amUTC();
  console.log(`[warranty-scheduler] First run in ${Math.round(delayMs / 60_000)}m (7:00 UTC daily)`);

  // Schedule first run at next 7am UTC, then repeat daily
  setTimeout(() => {
    void runWarrantyAlerts();
    _interval = setInterval(() => {
      void runWarrantyAlerts();
    }, DAILY_MS);
  }, delayMs);
}

export function stopWarrantyScheduler(): void {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
}

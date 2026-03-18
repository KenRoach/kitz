/** Scheduler — periodic jobs that need the WhatsApp adapter. */

import type { BaileysAdapter } from "../messaging/baileys.js";

let _adapter: BaileysAdapter | null = null;

export function initScheduler(adapter: BaileysAdapter): void {
  _adapter = adapter;
  console.log("[scheduler] Scheduler initialized with WhatsApp adapter");
}

export function getSchedulerAdapter(): BaileysAdapter | null {
  return _adapter;
}

/**
 * Kitz Gateway API client for RenewFlow.
 * Calls tools via POST /v0.1/tools/{name}/invoke
 */

import type { Asset, PurchaseOrder, SupportTicket, InboxMessage, RewardsProfile } from "@/types";

const BASE = "http://localhost:8787/v0.1";

async function invokeTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${BASE}/tools/${name}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ args }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Tool ${name} failed`);
  }
  const data = await res.json();
  return data.result as T;
}

// ── Asset Tools ──

export async function listAssets(filters?: {
  client?: string;
  tier?: string;
  status?: string;
  brand?: string;
  max_days?: number;
}): Promise<Asset[]> {
  const result = await invokeTool<{ assets: Asset[]; count: number }>("list_assets", filters ?? {});
  return result.assets;
}

export async function addAssets(assets: Asset[]): Promise<number> {
  const result = await invokeTool<{ inserted: number }>("add_assets", { assets });
  return result.inserted;
}

export interface AssetMetrics {
  totalDevices: number;
  uniqueClients: number;
  totalOEM: number;
  totalTPM: number;
  savings: number;
  alertCount: number;
  lapsedCount: number;
  quotedCount: number;
}

export async function getAssetMetrics(): Promise<AssetMetrics> {
  return invokeTool<AssetMetrics>("get_asset_metrics");
}

// ── Insights ──

export interface InsightsData {
  clientConcentration: { client: string; count: number; pct: number }[];
  expiryHeatmap: Record<string, number>;
  brandSavings: {
    brand: string;
    oem: number;
    tpm: number;
    savings: number;
    savingsPct: number;
    count: number;
  }[];
  revenueAtRisk: number;
  atRiskDevices: number;
  tierDistribution: { tier: string; count: number; pct: number }[];
  totalDevices: number;
}

export async function generateInsights(): Promise<InsightsData> {
  return invokeTool<InsightsData>("generate_insights");
}

// ── Orders ──

export async function listOrders(status?: string): Promise<PurchaseOrder[]> {
  const result = await invokeTool<{ orders: PurchaseOrder[]; count: number }>(
    "list_orders",
    status ? { status } : {},
  );
  return result.orders;
}

export async function createOrder(order: PurchaseOrder): Promise<PurchaseOrder> {
  const result = await invokeTool<{ order: PurchaseOrder }>("create_order", order as unknown as Record<string, unknown>);
  return result.order;
}

// ── Tickets ──

export async function listTickets(status?: string): Promise<SupportTicket[]> {
  const result = await invokeTool<{ tickets: SupportTicket[]; count: number }>(
    "list_tickets",
    status ? { status } : {},
  );
  return result.tickets;
}

// ── Inbox ──

export async function listInbox(): Promise<InboxMessage[]> {
  const result = await invokeTool<{ messages: InboxMessage[]; count: number }>("list_inbox");
  return result.messages;
}

// ── Rewards ──

export async function getRewards(): Promise<RewardsProfile> {
  return invokeTool<RewardsProfile>("get_rewards");
}

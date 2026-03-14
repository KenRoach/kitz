/**
 * RenewFlow Gateway API client.
 * Calls tools via POST /v0.1/tools/{name}/invoke
 */

import type { Asset, PurchaseOrder, SupportTicket, InboxMessage, RewardsProfile } from "@/types";

const BASE = (import.meta.env.VITE_API_BASE as string) || "/v0.1";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("rf_token");
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
}

async function invokeTool<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${BASE}/tools/${name}/invoke`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ args }),
  });
  if (res.status === 401) {
    localStorage.removeItem("rf_token");
    window.dispatchEvent(new Event("rf_logout"));
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Tool ${name} failed`);
  }
  const data = await res.json();
  return data.result as T;
}

// ── Auth ──

export async function loginUser(username: string, password: string): Promise<{ token: string; username: string; role: string }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error ?? "Login failed");
  }
  const data = await res.json();
  localStorage.setItem("rf_token", data.token);
  return data;
}

export async function registerUser(username: string, password: string): Promise<{ username: string; role: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Registration failed" }));
    throw new Error(err.error ?? "Registration failed");
  }
  return res.json();
}

export async function resetPassword(username: string, currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Password reset failed" }));
    throw new Error(err.error ?? "Password reset failed");
  }
  // Clear session — user must re-login with new password
  localStorage.removeItem("rf_token");
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

// ── AI Quoting ──

export interface QuoteResult {
  quoteId: string;
  recommendations: {
    assetId: string;
    coverageType: "oem" | "tpm";
    reason: string;
    risk: "critical" | "high" | "medium" | "low";
    price: number;
  }[];
  totalOem: number;
  totalTpm: number;
  savings: number;
  savingsPct: number;
  summary: string;
  clientEmail: { subject: string; body: string };
}

export async function generateQuote(assets: Asset[]): Promise<QuoteResult> {
  return invokeTool<QuoteResult>("generate_quote", {
    assets: assets.map((a) => ({
      id: a.id,
      brand: a.brand,
      model: a.model,
      serial: a.serial,
      client: a.client,
      tier: a.tier,
      daysLeft: a.daysLeft,
      oem: a.oem,
      tpm: a.tpm,
      deviceType: a.deviceType,
    })),
  });
}

// ── Delivery Partners ──

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  capabilities: string[];
  regions: string[];
  active: boolean;
}

export async function listPartners(): Promise<DeliveryPartner[]> {
  const result = await invokeTool<{ partners: DeliveryPartner[]; count: number }>("list_partners");
  return result.partners;
}

export async function submitPoToPartner(orderId: string, partnerId: string): Promise<{
  submissionId: string;
  orderId: string;
  partnerId: string;
  partnerName: string;
  status: string;
}> {
  return invokeTool("submit_po_to_partner", { orderId, partnerId });
}

export async function acknowledgePo(submissionId: string): Promise<{ submissionId: string; status: string }> {
  return invokeTool("acknowledge_po", { submissionId });
}

export async function fulfillPo(submissionId: string, tracking?: string): Promise<{ submissionId: string; status: string; tracking: string | null }> {
  return invokeTool("fulfill_po", { submissionId, tracking });
}

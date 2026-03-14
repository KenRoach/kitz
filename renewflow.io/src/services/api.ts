// ─── API Service Layer ───
// Calls Next.js API routes (RenewFlow's own backend)

const API_BASE = "/api";
const TOKEN_KEY = "renewflow_token";
const USER_KEY = "renewflow_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getOrgId(): string {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    return user.orgId || "";
  } catch {
    return "";
  }
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-org-id": getOrgId(),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new CustomEvent("renewflow:auth-expired"));
    throw new ApiError(res.status, "AUTH_EXPIRED", "Session expired");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "API_ERROR", data.message || "Request failed");
  }

  return data as T;
}

// ─── Assets ───

export interface ListAssetsResponse {
  data: unknown[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function listAssets(params?: Record<string, string>): Promise<ListAssetsResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`/assets${query}`);
}

export async function addAssets(assets: unknown[]): Promise<{ added: number }> {
  return apiFetch("/assets/import", { method: "POST", body: JSON.stringify({ assets }) });
}

export async function getAssetMetrics(): Promise<Record<string, unknown>> {
  return apiFetch("/insights");
}

export async function generateInsights(): Promise<Record<string, unknown>> {
  return apiFetch("/insights");
}

// ─── Quotes ───

export interface QuoteResult {
  quoteId: string;
  date: string;
  coverageType: "tpm" | "oem";
  deviceCount: number;
  clients: string[];
  items: {
    assetId: string;
    brand: string;
    model: string;
    serial: string;
    client: string;
    deviceType: string;
    tier: string;
    daysLeft: number;
    tpmPrice: number;
    oemPrice: number | null;
    selectedCoverage: "tpm" | "oem";
    lineTotal: number;
  }[];
  summary: {
    totalTPM: number;
    totalOEM: number;
    selectedTotal: number;
    savings: number;
    savingsPct: number;
  };
  status: string;
}

export async function generateQuote(assetIds: string[], coverageType: "tpm" | "oem"): Promise<QuoteResult> {
  return apiFetch("/chat", { method: "POST", body: JSON.stringify({ assetIds, coverageType, action: "generate_quote" }) });
}

export interface CustomQuoteItem {
  brand: string;
  model: string;
  deviceType: string;
  tier: string;
  quantity: number;
  coverageType: "tpm" | "oem";
}

export async function generateCustomQuote(items: CustomQuoteItem[], client: string): Promise<QuoteResult> {
  return apiFetch("/chat", { method: "POST", body: JSON.stringify({ items, client, action: "generate_custom_quote" }) });
}

// ─── Orders ───

export async function listOrders(): Promise<{ data: unknown[]; hasMore: boolean }> {
  return apiFetch("/orders");
}

export async function createOrder(order: unknown): Promise<{ orderId: string }> {
  return apiFetch("/orders", { method: "POST", body: JSON.stringify(order) });
}

// ─── Support ───

export async function listTickets(): Promise<{ data: unknown[]; hasMore: boolean }> {
  return apiFetch("/tickets");
}

// ─── Rewards ───

export async function getRewards(): Promise<Record<string, unknown>> {
  return apiFetch("/rewards");
}

// ─── Email ───

export interface SendQuoteEmailResponse {
  success: boolean;
  sent: string[];
  failed: string[];
  quoteId: string;
}

export async function sendQuoteEmail(
  recipients: string[],
  quote: QuoteResult,
  senderName: string,
  senderEmail: string,
): Promise<SendQuoteEmailResponse> {
  return apiFetch("/email/send", {
    method: "POST",
    body: JSON.stringify({ to: recipients, subject: `Warranty Quote`, text: JSON.stringify(quote), senderName, senderEmail }),
  });
}

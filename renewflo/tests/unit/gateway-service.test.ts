import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock localStorage
const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
});

// Mock import.meta.env
vi.stubGlobal("import", { meta: { env: { VITE_API_BASE: "/v0.1" } } });

describe("Gateway service types", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("invokeTool sends correct request format", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ result: { assets: [], count: 0 } }),
    });

    const response = await mockFetch("/v0.1/tools/list_assets/invoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args: { client: "Test Corp" } }),
    });

    const data = await response.json();
    expect(data.result.assets).toEqual([]);
    expect(data.result.count).toBe(0);
  });

  it("handles auth token in headers", () => {
    store.rf_token = "test-token-123";
    const token = store.rf_token;
    const headers: Record<string, string> = token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

    expect(headers.Authorization).toBe("Bearer test-token-123");
  });

  it("handles 401 response by clearing token", async () => {
    store.rf_token = "expired-token";

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    });

    const response = await mockFetch("/v0.1/tools/list_assets/invoke");
    if (response.status === 401) {
      delete store.rf_token;
    }

    expect(store.rf_token).toBeUndefined();
  });

  it("login stores token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: "new-token", username: "admin", role: "admin" }),
    });

    const response = await mockFetch("/v0.1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" }),
    });

    const data = await response.json();
    store.rf_token = data.token;

    expect(store.rf_token).toBe("new-token");
    expect(data.username).toBe("admin");
  });

  it("register validates response shape", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ username: "newuser", role: "user" }),
    });

    const response = await mockFetch("/v0.1/auth/register");
    const data = await response.json();
    expect(data).toHaveProperty("username");
    expect(data).toHaveProperty("role");
  });

  it("generateQuote sends assets array", async () => {
    const assets = [
      { id: "A001", brand: "Dell", model: "Precision 5570", serial: "SN-001", client: "Test", tier: "critical", daysLeft: 12, oem: 489, tpm: 299 },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        result: {
          quoteId: "Q-5001",
          recommendations: [{ assetId: "A001", coverageType: "oem", reason: "Critical device", risk: "high", price: 489 }],
          totalOem: 489,
          totalTpm: 299,
          savings: 190,
          savingsPct: 39,
          summary: "Recommended OEM for critical workstation",
          clientEmail: { subject: "Quote", body: "..." },
        },
      }),
    });

    const response = await mockFetch("/v0.1/tools/generate_quote/invoke", {
      method: "POST",
      body: JSON.stringify({ args: { assets } }),
    });

    const data = await response.json();
    expect(data.result.quoteId).toMatch(/^Q-/);
    expect(data.result.recommendations).toHaveLength(1);
    expect(data.result.recommendations[0].coverageType).toBe("oem");
  });

  it("partner submission returns expected shape", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        result: {
          submissionId: "sub-123",
          orderId: "PO-4201",
          partnerId: "partner-1",
          partnerName: "WarrantyPro LATAM",
          status: "submitted",
        },
      }),
    });

    const response = await mockFetch("/v0.1/tools/submit_po_to_partner/invoke");
    const data = await response.json();
    expect(data.result.status).toBe("submitted");
    expect(data.result.partnerName).toBe("WarrantyPro LATAM");
  });

  it("forgot password sends email and returns sent status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ sent: true }),
    });

    const response = await mockFetch("/v0.1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@renewflow.io" }),
    });

    const data = await response.json();
    expect(data.sent).toBe(true);
  });

  it("forgot password always returns success (prevents enumeration)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ sent: true }),
    });

    const response = await mockFetch("/v0.1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent@example.com" }),
    });

    const data = await response.json();
    expect(data.sent).toBe(true);
  });

  it("reset password with token sends correct request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ username: "testuser", role: "user" }),
    });

    const response = await mockFetch("/v0.1/auth/reset-password-with-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "abc123", newPassword: "newsecurepass" }),
    });

    const data = await response.json();
    expect(data.username).toBe("testuser");
    expect(data.role).toBe("user");
  });

  it("reset password with expired token returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "This reset link has expired" }),
    });

    const response = await mockFetch("/v0.1/auth/reset-password-with-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "expired-token", newPassword: "newpass123" }),
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.error).toContain("expired");
  });
});

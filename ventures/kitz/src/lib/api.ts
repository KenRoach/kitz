// Server-side only — do not import from client components
const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const FACTORY_URL =
  process.env.FACTORY_API_URL || (isLocal ? "http://localhost:3000" : "");
const CONTACT_URL =
  process.env.CONTACT_ENGINE_URL || (isLocal ? "http://localhost:3003" : "");
const AGENT_URL =
  process.env.AGENT_RUNTIME_URL || (isLocal ? "http://localhost:3001" : "");
const API_KEY = process.env.API_KEY || "";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) h["Authorization"] = `Bearer ${API_KEY}`;
  return h;
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) throw new Error("API base URL not configured");
  const res = await fetch(`${baseUrl}${path}`, {
    headers: authHeaders(),
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const factoryApi = {
  get: <T>(path: string) => request<T>(FACTORY_URL, path),
  post: <T>(path: string, body: unknown) => request<T>(FACTORY_URL, path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(FACTORY_URL, path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(FACTORY_URL, path, { method: "DELETE" }),
};

export const contactApi = {
  get: <T>(path: string) => request<T>(CONTACT_URL, path),
  post: <T>(path: string, body: unknown) => request<T>(CONTACT_URL, path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(CONTACT_URL, path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(CONTACT_URL, path, { method: "DELETE" }),
};

export const agentApi = {
  post: <T>(path: string, body: unknown) => request<T>(AGENT_URL, path, { method: "POST", body: JSON.stringify(body) }),
};

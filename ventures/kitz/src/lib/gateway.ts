const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : "");

export async function gatewayFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  if (!GATEWAY_URL) throw new Error("Gateway URL not configured");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("flow_token");
      localStorage.removeItem("flow_username");
      window.location.href = "/flow/login";
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function loginVar(email: string, password: string) {
  return gatewayFetch<{ token: string; username: string; role: string }>(
    "/v0.1/auth/login",
    { method: "POST", body: JSON.stringify({ username: email, password }) }
  );
}

export async function registerVar(email: string, password: string, companyName: string) {
  return gatewayFetch<{ token: string; username: string; role: string; org_id: string }>(
    "/v0.1/auth/register-var",
    { method: "POST", body: JSON.stringify({ email, password, company_name: companyName }) }
  );
}

export async function invokeTool<T>(name: string, args: Record<string, unknown>, token: string) {
  return gatewayFetch<{ tool: string; result: T }>(
    `/v0.1/tools/${name}/invoke`,
    { method: "POST", body: JSON.stringify({ args }) },
    token
  );
}

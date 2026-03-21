# Flow Workspace MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Flow workspace inside KitZ that lets VARs self-register, onboard, and use all RenewFlow tools via iframe embedding.

**Architecture:** New `/flow` route group in `ventures/kitz/` with its own layout (no admin sidebar). Gateway gets a VAR registration endpoint and auth middleware on tool routes. The `renewflo/` app gets a small postMessage listener for auth handoff. Both frontends deploy on Vercel, gateway stays on Railway.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Fastify (gateway), Supabase Auth, Vercel

**Spec:** `docs/superpowers/specs/2026-03-20-flow-workspace-mvp-design.md`

---

## File Structure

### New files — `ventures/kitz/`

```
ventures/kitz/src/app/flow/
├── layout.tsx              # Flow-specific layout (auth check, no admin nav)
├── (auth)/                 # Route group for unauthenticated pages (no sidebar)
│   ├── layout.tsx          # Minimal layout (no sidebar)
│   ├── login/page.tsx      # Login page
│   └── register/page.tsx   # Registration page (email, password, company)
├── (workspace)/            # Route group for authenticated pages (with sidebar)
│   ├── layout.tsx          # Workspace layout with FlowShell sidebar
│   ├── page.tsx            # Redirects to dashboard or login
│   ├── onboarding/
│   │   └── page.tsx        # 3-step onboarding wizard (client component)
│   ├── dashboard/page.tsx  # VAR dashboard with scoped metrics
│   └── renewflow/page.tsx  # iframe embedding renewflo/ app
ventures/kitz/src/components/flow/
├── flow-sidebar.tsx        # Flow sidebar (Dashboard, RenewFlow, Account)
├── flow-shell.tsx          # Flow shell (sidebar + main area)
└── auth-provider.tsx       # Client-side auth context (token, user, logout)
ventures/kitz/src/lib/
└── gateway.ts              # Gateway API client for Flow pages
```

### Modified files — `kitz_gateway_ts/`

```
kitz_gateway_ts/src/auth/service.ts     # Add registerVar() function
kitz_gateway_ts/src/auth/routes.ts      # Add POST /v0.1/auth/register-var
kitz_gateway_ts/src/routes/tools.ts     # Add auth middleware, inject org_id
kitz_gateway_ts/src/index.ts            # Update CORS config (if hardcoded)
```

### Modified files — `renewflo/`

```
renewflo/src/main.tsx                   # Add postMessage auth listener
renewflo/vercel.json                    # New — frame-ancestors CSP header
```

### New files — deployment

```
ventures/kitz/vercel.json               # Vercel monorepo config
```

---

## Task 1: Gateway — VAR registration endpoint

**Files:**
- Modify: `kitz_gateway_ts/src/auth/service.ts:60-83`
- Modify: `kitz_gateway_ts/src/auth/routes.ts:23-33`
- Test: `kitz_gateway_ts/tests/register-var.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// kitz_gateway_ts/tests/register-var.test.ts
import { describe, it, expect, vi } from "vitest";
import { registerVar } from "../src/auth/service.js";

// Mock Supabase
vi.mock("../src/db/client.js", () => ({
  getSupabase: () => ({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-id", email: "var@test.com" } },
          error: null,
        }),
      },
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "org-id", name: "Test Corp", slug: "test-corp" },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe("registerVar", () => {
  it("creates org + user and returns token-compatible response", async () => {
    const result = await registerVar("var@test.com", "password123", "Test Corp");
    expect(result).toHaveProperty("username");
    expect(result).toHaveProperty("role", "var");
    expect(result).toHaveProperty("org_id");
  });

  it("rejects short passwords", async () => {
    await expect(registerVar("var@test.com", "short", "Test Corp")).rejects.toThrow(
      "Password must be at least 8 characters"
    );
  });

  it("requires company_name", async () => {
    await expect(registerVar("var@test.com", "password123", "")).rejects.toThrow(
      "Company name is required"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/fliaroach/kitz/kitz_gateway_ts && npx vitest run tests/register-var.test.ts`
Expected: FAIL — `registerVar` is not exported from service.ts

- [ ] **Step 3: Implement registerVar in auth service**

Add to `kitz_gateway_ts/src/auth/service.ts` after the existing `registerUser` function:

```typescript
export async function registerVar(
  email: string,
  password: string,
  companyName: string
): Promise<{ username: string; role: string; org_id: string }> {
  if (password.length < 8) throw new Error("Password must be at least 8 characters");
  if (!companyName.trim()) throw new Error("Company name is required");

  const db = getSupabase();

  // Create org for this VAR
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: org, error: orgErr } = await db
    .from("core_org")
    .insert({ name: companyName.trim(), slug })
    .select()
    .single();
  if (orgErr) throw new Error(`Failed to create organization: ${orgErr.message}`);

  // Create Supabase Auth user with org_id in metadata
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { org_id: org.id, role: "var", full_name: companyName.trim() },
  });
  if (error) {
    // Clean up org if user creation fails
    await db.from("core_org").delete().eq("id", org.id);
    throw new Error(error.message);
  }

  // Create core_user row (consistent with existing login/validateToken lookups)
  await db.from("core_user").insert({
    id: data.user.id,
    full_name: companyName.trim(),
    role: "var",
    org_id: org.id,
  });

  return { username: data.user.email || email, role: "var", org_id: org.id };
}
```

- [ ] **Step 4: Add route for register-var**

In `kitz_gateway_ts/src/auth/routes.ts`, add inside `registerAuthHandlers` after the existing register route (after line 33):

```typescript
  app.post(`${prefix}/register-var`, async (request, reply) => {
    const { email, password, company_name } = request.body as {
      email: string;
      password: string;
      company_name: string;
    };
    if (!email || !password || !company_name) {
      return reply.status(400).send({ error: "email, password, and company_name required" });
    }
    try {
      const result = await registerVar(email, password, company_name);
      // Auto-login after registration
      const loginResult = await login(email, password);
      return { ...result, token: loginResult.token };
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });
```

Update the import at top of routes.ts:
```typescript
import { login, registerUser, registerVar, resetPassword, forgotPassword, resetPasswordWithToken } from "./service.js";
```

- [ ] **Step 5: Run tests**

Run: `cd /Users/fliaroach/kitz/kitz_gateway_ts && npx vitest run tests/register-var.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/fliaroach/kitz
git add kitz_gateway_ts/src/auth/service.ts kitz_gateway_ts/src/auth/routes.ts kitz_gateway_ts/tests/register-var.test.ts
git commit -m "feat(gateway): add VAR self-registration endpoint"
```

---

## Task 2: Gateway — Auth middleware on tool routes

**Files:**
- Modify: `kitz_gateway_ts/src/routes/tools.ts:27-47`
- Modify: `kitz_gateway_ts/src/auth/service.ts:41-57` (update validateToken to return org_id)
- Test: `kitz_gateway_ts/tests/tool-auth.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// kitz_gateway_ts/tests/tool-auth.test.ts
import { describe, it, expect, vi } from "vitest";
import { validateToken } from "../src/auth/service.js";

vi.mock("../src/db/client.js", () => ({
  getSupabase: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-id",
            email: "var@test.com",
            user_metadata: { org_id: "org-123", role: "var" },
          },
        },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: "var", full_name: "Test VAR" },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

describe("validateToken returns org_id", () => {
  it("includes org_id from user_metadata", async () => {
    const user = await validateToken("valid-token");
    expect(user).not.toBeNull();
    expect(user!.org_id).toBe("org-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/fliaroach/kitz/kitz_gateway_ts && npx vitest run tests/tool-auth.test.ts`
Expected: FAIL — `org_id` property does not exist on AuthUser

- [ ] **Step 3: Update AuthUser interface and validateToken**

In `kitz_gateway_ts/src/auth/service.ts`, update the interface and function:

```typescript
export interface AuthUser {
  id: string;
  username: string;
  role: string;
  org_id: string | null;
}
```

Update `validateToken` to return `org_id`:

```typescript
export async function validateToken(token: string): Promise<AuthUser | null> {
  const db = getSupabase();
  const { data, error } = await db.auth.getUser(token);

  if (error || !data.user) return null;

  const { data: coreUser } = await db
    .from("core_user")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  const meta = data.user.user_metadata as Record<string, string> | undefined;

  return {
    id: data.user.id,
    username: coreUser?.full_name || data.user.email || "",
    role: coreUser?.role || meta?.role || "member",
    org_id: meta?.org_id || null,
  };
}
```

- [ ] **Step 4: Add auth middleware to tool invoke route**

In `kitz_gateway_ts/src/routes/tools.ts`, update the invoke route:

```typescript
import { validateToken } from "../auth/service.js";

// Inside toolRoutes function, replace the existing invoke handler:
  app.post<{ Params: { name: string } }>(
    "/v0.1/tools/:name/invoke",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const { name } = request.params;
      const body = (request.body as { args?: Record<string, unknown> }) ?? {};
      const args = body.args ?? {};

      // Auth middleware: extract org_id from token and inject into args
      // Rejects unauthenticated requests — all tool calls require a valid token
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Authorization required" });
      }
      const token = authHeader.slice(7);
      const user = await validateToken(token);
      if (!user) {
        return reply.status(401).send({ error: "Invalid or expired token" });
      }
      // Enforce org_id server-side — VARs cannot query across tenants
      if (user.org_id) {
        args.org_id = user.org_id;
      }

      try {
        const result = await registry.invoke(name, args);
        return { tool: name, result };
      } catch (err) {
        if (err instanceof ToolNotFoundError) {
          return reply.status(404).send({ error: err.message });
        }
        const message = err instanceof Error ? err.message : "Internal error";
        const status = message.includes("required") || message.includes("must be") ? 400 : 500;
        return reply.status(status).send({ error: message });
      }
    },
  );
```

Also update `get_asset_metrics` in `kitz_gateway_ts/src/tools/assets.ts` to accept and use `org_id`:

```typescript
  {
    name: "get_asset_metrics",
    description: "Calculate portfolio KPIs",
    handler: async (args) => {
      const db = getSupabase();
      let query = db.from("asset_item").select("*");
      if (args.org_id) query = query.eq("org_id", args.org_id as string);
      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const assets = data ?? [];
      return {
        totalDevices: assets.length,
        uniqueOrgs: new Set(assets.map((a) => a.org_id)).size,
        quotedCount: assets.filter((a) => a.status === "quoted").length,
      };
    },
  },
```

Also update `add_assets` in `kitz_gateway_ts/src/tools/assets.ts` to use `args.org_id` as fallback for each asset row:

```typescript
  {
    name: "add_assets",
    description: "Bulk insert/update assets",
    handler: async (args) => {
      const db = getSupabase();
      const assets = args.assets as Record<string, unknown>[];
      if (!Array.isArray(assets)) throw new Error("assets must be an array");

      const rows = assets.map((a) => ({
        id: a.id,
        org_id: a.orgId ?? a.org_id ?? args.org_id,  // fallback to auth-injected org_id
        import_batch_id: a.importBatchId ?? a.import_batch_id,
        brand: a.brand,
        model: a.model,
        serial: a.serial,
        tier: a.tier,
        status: a.status,
        warranty_end: a.warrantyEnd ?? a.warranty_end,
        device_type: a.deviceType ?? a.device_type,
        purchase_date: a.purchaseDate ?? a.purchase_date,
      }));

      const { error } = await db.from("asset_item").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(error.message);

      return { inserted: rows.length };
    },
  },
```

Also update `list_assets` to always enforce `org_id` from args (already does this, but confirm it uses the middleware-injected value).

- [ ] **Step 5: Run tests**

Run: `cd /Users/fliaroach/kitz/kitz_gateway_ts && npx vitest run`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/fliaroach/kitz
git add kitz_gateway_ts/src/auth/service.ts kitz_gateway_ts/src/routes/tools.ts kitz_gateway_ts/src/tools/assets.ts kitz_gateway_ts/tests/tool-auth.test.ts
git commit -m "feat(gateway): add auth middleware to tool routes with org_id scoping"
```

---

## Task 3: renewflo/ — postMessage auth listener

**Files:**
- Modify: `renewflo/src/main.tsx:1-9`
- Create: `renewflo/vercel.json`
- Test: Manual — verify postMessage sets rf_token in localStorage

- [ ] **Step 1: Add postMessage listener to main.tsx**

Update `renewflo/src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";

// Listen for auth token from parent Flow shell (iframe embedding)
window.addEventListener("message", (event) => {
  // Only accept messages from known Flow shell origins
  const allowedOrigins = [
    "https://flow.kitz.services",
    "http://localhost:4000",
    "http://localhost:3000",
  ];
  if (!allowedOrigins.includes(event.origin)) return;

  if (event.data?.type === "rf_auth" && event.data?.token) {
    localStorage.setItem("rf_token", event.data.token);
    window.dispatchEvent(new Event("rf_auth_updated"));
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 2: Create vercel.json with CSP headers**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://flow.kitz.services http://localhost:4000"
        }
      ]
    }
  ]
}
```

Save to `renewflo/vercel.json`.

- [ ] **Step 3: Run renewflo build to verify no breakage**

Run: `cd /Users/fliaroach/kitz/renewflo && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/fliaroach/kitz
git add renewflo/src/main.tsx renewflo/vercel.json
git commit -m "feat(renewflo): add postMessage auth listener for iframe embedding"
```

---

## Task 4: Flow shell — layout, sidebar, auth provider

**Files:**
- Create: `ventures/kitz/src/app/flow/layout.tsx`
- Create: `ventures/kitz/src/components/flow/flow-sidebar.tsx`
- Create: `ventures/kitz/src/components/flow/flow-shell.tsx`
- Create: `ventures/kitz/src/components/flow/auth-provider.tsx`
- Create: `ventures/kitz/src/lib/gateway.ts`

- [ ] **Step 1: Create gateway API client**

```typescript
// ventures/kitz/src/lib/gateway.ts
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8787";

export async function gatewayFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });
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
```

- [ ] **Step 2: Create auth provider**

```typescript
// ventures/kitz/src/components/flow/auth-provider.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  token: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [auth, setAuthState] = useState<AuthState>({ token: null, username: null });

  useEffect(() => {
    const token = localStorage.getItem("flow_token");
    const username = localStorage.getItem("flow_username");
    if (token) setAuthState({ token, username });
  }, []);

  const setAuth = useCallback((token: string, username: string) => {
    localStorage.setItem("flow_token", token);
    localStorage.setItem("flow_username", username);
    setAuthState({ token, username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("flow_token");
    localStorage.removeItem("flow_username");
    setAuthState({ token: null, username: null });
    router.push("/flow/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
```

- [ ] **Step 3: Create Flow sidebar**

```typescript
// ventures/kitz/src/components/flow/flow-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/flow/dashboard" },
  { label: "RenewFlow", href: "/flow/renewflow" },
] as const;

export function FlowSidebar() {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-lg font-bold text-gray-900">Flow</span>
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
          workspace
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {username && (
        <div className="border-t border-gray-200 p-3">
          <p className="truncate text-sm font-medium text-gray-700">{username}</p>
          <button
            onClick={logout}
            className="mt-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Create Flow shell**

```typescript
// ventures/kitz/src/components/flow/flow-shell.tsx
import { FlowSidebar } from "./flow-sidebar";

export function FlowShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <FlowSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Create Flow root layout (auth provider only, no sidebar)**

```typescript
// ventures/kitz/src/app/flow/layout.tsx
import { AuthProvider } from "@/components/flow/auth-provider";

export const metadata = {
  title: "Flow — Workspace",
  description: "Your business tools workspace",
};

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

- [ ] **Step 6: Create auth route group layout (no sidebar)**

```typescript
// ventures/kitz/src/app/flow/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 7: Create workspace route group layout (with sidebar)**

```typescript
// ventures/kitz/src/app/flow/(workspace)/layout.tsx
import { FlowShell } from "@/components/flow/flow-shell";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <FlowShell>{children}</FlowShell>;
}
```

- [ ] **Step 8: Create Flow index page (auth-aware redirect)**

```typescript
// ventures/kitz/src/app/flow/(workspace)/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";

export default function FlowPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/flow/dashboard");
    } else {
      router.push("/flow/login");
    }
  }, [token, router]);

  return null;
}
```

- [ ] **Step 9: Verify build**

Run: `cd /Users/fliaroach/kitz/ventures/kitz && npm run build`
Expected: Build succeeds (pages may show empty content, that's fine)

- [ ] **Step 10: Commit**

```bash
cd /Users/fliaroach/kitz
git add ventures/kitz/src/app/flow/ ventures/kitz/src/components/flow/ ventures/kitz/src/lib/gateway.ts
git commit -m "feat(flow): add Flow shell layout, sidebar, and auth provider"
```

---

## Task 5: Flow — Login and Register pages

**Files:**
- Create: `ventures/kitz/src/app/flow/login/page.tsx`
- Create: `ventures/kitz/src/app/flow/register/page.tsx`

- [ ] **Step 1: Create login page**

```typescript
// ventures/kitz/src/app/flow/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { loginVar } from "@/lib/gateway";

export default function FlowLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginVar(email, password);
      setAuth(result.token, result.username);
      router.push("/flow/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to Flow</h1>
          <p className="mt-1 text-sm text-gray-500">Your business tools workspace</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          No account?{" "}
          <Link href="/flow/register" className="text-purple-600 hover:text-purple-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create register page**

```typescript
// ventures/kitz/src/app/flow/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { registerVar } from "@/lib/gateway";

export default function FlowRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await registerVar(email, password, companyName);
      setAuth(result.token, result.username);
      router.push("/flow/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your Flow workspace</h1>
          <p className="mt-1 text-sm text-gray-500">Get started in minutes</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/flow/login" className="text-purple-600 hover:text-purple-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/fliaroach/kitz/ventures/kitz && npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/fliaroach/kitz
git add "ventures/kitz/src/app/flow/(auth)/"
git commit -m "feat(flow): add login and registration pages"
```

---

## Task 6: Flow — Onboarding wizard

**Files:**
- Create: `ventures/kitz/src/app/flow/onboarding/page.tsx`

- [ ] **Step 1: Create onboarding page**

```typescript
// ventures/kitz/src/app/flow/(workspace)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flow/auth-provider";
import { invokeTool } from "@/lib/gateway";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [companyInfo, setCompanyInfo] = useState({ industry: "", size: "" });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>("");
  const [error, setError] = useState("");
  const { token } = useAuth();
  const router = useRouter();

  async function handleCsvUpload() {
    if (!csvFile || !token) return;
    setImporting(true);
    setError("");
    try {
      const text = await csvFile.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const assets = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = values[i] || ""; });
        return {
          serial: row.serial || row.serial_number || "",
          model: row.model || "",
          brand: row.brand || row.vendor || row.manufacturer || "",
          warranty_end: row.warranty_end || row.expiry || row.expiration || "",
          device_type: row.device_type || row.type || "server",
          status: "active",
        };
      });
      const result = await invokeTool<{ inserted: number }>("add_assets", { assets }, token);
      setImportResult(`${result.result.inserted} devices imported`);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (step === 1) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pt-12">
        <div>
          <p className="text-sm text-gray-500">Step 1 of 3</p>
          <h1 className="text-2xl font-bold text-gray-900">Tell us about your business</h1>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              value={companyInfo.industry}
              onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              <option value="it-reseller">IT Reseller / VAR</option>
              <option value="msp">Managed Service Provider</option>
              <option value="distributor">Distributor</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company size</label>
            <select
              value={companyInfo.size}
              onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select...</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="200+">200+ employees</option>
            </select>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pt-12">
        <div>
          <p className="text-sm text-gray-500">Step 2 of 3</p>
          <h1 className="text-2xl font-bold text-gray-900">Import your devices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a CSV with columns: serial, model, brand, warranty_end, device_type
          </p>
        </div>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleCsvUpload}
              disabled={!csvFile || importing}
              className="flex-1 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3
  return (
    <div className="mx-auto max-w-lg space-y-6 pt-12 text-center">
      <div>
        <p className="text-sm text-gray-500">Step 3 of 3</p>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re all set!</h1>
        {importResult && <p className="mt-2 text-sm text-green-600">{importResult}</p>}
        <p className="mt-2 text-sm text-gray-500">Your Flow workspace is ready.</p>
      </div>
      <button
        onClick={() => router.push("/flow/dashboard")}
        className="rounded-md bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fliaroach/kitz/ventures/kitz && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/fliaroach/kitz
git add "ventures/kitz/src/app/flow/(workspace)/onboarding/"
git commit -m "feat(flow): add 3-step onboarding wizard with CSV import"
```

---

## Task 7: Flow — Dashboard page

**Files:**
- Create: `ventures/kitz/src/app/flow/dashboard/page.tsx`

- [ ] **Step 1: Create dashboard page**

```typescript
// ventures/kitz/src/app/flow/(workspace)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/flow/auth-provider";
import { invokeTool } from "@/lib/gateway";

interface Metrics {
  totalDevices: number;
  uniqueOrgs: number;
  quotedCount: number;
}

export default function FlowDashboardPage() {
  const { token, username } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    invokeTool<Metrics>("get_asset_metrics", {}, token)
      .then((res) => setMetrics(res.result))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back{username ? `, ${username}` : ""}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Active Devices"
          value={loading ? "..." : String(metrics?.totalDevices ?? 0)}
        />
        <MetricCard
          label="Quoted"
          value={loading ? "..." : String(metrics?.quotedCount ?? 0)}
        />
        <MetricCard
          label="Organizations"
          value={loading ? "..." : String(metrics?.uniqueOrgs ?? 0)}
        />
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/flow/renewflow"
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-purple-300 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-gray-900">RenewFlow</h3>
            <p className="mt-1 text-sm text-gray-500">
              Warranty renewal platform — quotes, orders, alerts, and more
            </p>
            <span className="mt-3 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Active
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fliaroach/kitz/ventures/kitz && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/fliaroach/kitz
git add "ventures/kitz/src/app/flow/(workspace)/dashboard/"
git commit -m "feat(flow): add dashboard page with metrics and product card"
```

---

## Task 8: Flow — RenewFlow iframe page

**Files:**
- Create: `ventures/kitz/src/app/flow/renewflow/page.tsx`

- [ ] **Step 1: Create RenewFlow iframe page**

```typescript
// ventures/kitz/src/app/flow/(workspace)/renewflow/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/flow/auth-provider";

const RENEWFLOW_URL = process.env.NEXT_PUBLIC_RENEWFLOW_URL || "http://localhost:3000";

export default function FlowRenewFlowPage() {
  const { token } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!token || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const sendToken = () => {
      iframe.contentWindow?.postMessage(
        { type: "rf_auth", token },
        RENEWFLOW_URL
      );
    };

    // Send token once iframe loads
    iframe.addEventListener("load", sendToken);
    return () => iframe.removeEventListener("load", sendToken);
  }, [token]);

  return (
    <div className="-m-6 h-[calc(100vh)] w-[calc(100%+3rem)]">
      <iframe
        ref={iframeRef}
        src={RENEWFLOW_URL}
        className="h-full w-full border-0"
        title="RenewFlow"
        allow="clipboard-write"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/fliaroach/kitz/ventures/kitz && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/fliaroach/kitz
git add "ventures/kitz/src/app/flow/(workspace)/renewflow/"
git commit -m "feat(flow): add RenewFlow iframe embedding page with auth handoff"
```

---

## Task 9: Vercel deployment config

**Files:**
- Create: `ventures/kitz/vercel.json`
- Verify: `renewflo/vercel.json` (created in Task 3)

- [ ] **Step 1: Create ventures/kitz vercel.json**

```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@kitz/web"
}
```

Save to `ventures/kitz/vercel.json`.

Note: When setting up Vercel, set the "Root Directory" to `ventures/kitz/` in the Vercel dashboard.

- [ ] **Step 2: Add NEXT_PUBLIC env vars documentation**

The following env vars must be set in Vercel dashboard for the `ventures/kitz` deployment:
- `NEXT_PUBLIC_GATEWAY_URL` = the Railway gateway URL (e.g. `https://kitz-gateway-production.up.railway.app`)
- `NEXT_PUBLIC_RENEWFLOW_URL` = the Vercel renewflo deployment URL (e.g. `https://app.renewflow.io`)

And the gateway's `CORS_ORIGIN` on Railway must include both Vercel domains.

- [ ] **Step 3: Commit**

```bash
cd /Users/fliaroach/kitz
git add ventures/kitz/vercel.json
git commit -m "chore: add Vercel deployment config for Flow workspace"
```

---

## Task 10: Integration smoke test

- [ ] **Step 1: Start gateway locally**

```bash
cd /Users/fliaroach/kitz/kitz_gateway_ts && npm run dev
```

- [ ] **Step 2: Start renewflo locally**

```bash
cd /Users/fliaroach/kitz/renewflo && npm run dev
```

- [ ] **Step 3: Start Flow (ventures/kitz) locally**

```bash
cd /Users/fliaroach/kitz/ventures/kitz && npm run dev
```

- [ ] **Step 4: Test registration flow**

1. Open `http://localhost:4000/flow/register`
2. Fill in company name, email, password
3. Submit → should redirect to `/flow/onboarding`
4. Complete onboarding (skip CSV for now)
5. Should arrive at `/flow/dashboard` with metrics

- [ ] **Step 5: Test RenewFlow embedding**

1. Click "RenewFlow" in sidebar or product card
2. Should load `http://localhost:3000` in iframe
3. RenewFlow should receive auth token via postMessage
4. All RenewFlow tools should work (dashboard, quoter, etc.)

- [ ] **Step 6: Test login flow**

1. Log out from Flow
2. Go to `/flow/login`
3. Log in with the account created during registration
4. Should arrive at dashboard with same data

- [ ] **Step 7: Run all gateway tests**

```bash
cd /Users/fliaroach/kitz/kitz_gateway_ts && npx vitest run
```
Expected: ALL PASS

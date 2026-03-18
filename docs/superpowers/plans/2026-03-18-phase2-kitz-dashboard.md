# Phase 2: Wire KitZ Dashboard to Real API Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded mock data in the KitZ dashboard with live API calls to factory-api, contact-engine, and agent-runtime so operators can manage ventures, skills, contacts, and deals through the browser.

**Architecture:** Server-side `api.ts` fetches directly from backend services using env vars (`FACTORY_API_URL`, `CONTACT_ENGINE_URL`, etc.) with `API_KEY` injected as Bearer token. All data fetching happens in server components or server actions — the API key is never exposed to the browser. `services.ts` is rewritten to match actual backend route patterns (e.g., `/contacts?venture_id=...` not `/ventures/:id/contacts`).

**Tech Stack:** Next.js 14 App Router, React 18, server components, server actions, Tailwind CSS

**Prerequisite:** Phase 1 must be complete (auth middleware, validation, DELETE routes).

---

### Task 1: Rewrite API Client and Services Layer

**Files:**
- Rewrite: `ventures/kitz/src/lib/api.ts`
- Rewrite: `ventures/kitz/src/lib/services.ts`

- [ ] **Step 1: Rewrite api.ts for server-side fetching**

The API client runs server-side only. It reads backend URLs and API_KEY from env vars (NOT prefixed with `NEXT_PUBLIC_`):

```typescript
// Server-side only — do not import from client components
const FACTORY_URL = process.env.FACTORY_API_URL || "http://localhost:3000";
const CONTACT_URL = process.env.CONTACT_ENGINE_URL || "http://localhost:3003";
const AGENT_URL = process.env.AGENT_RUNTIME_URL || "http://localhost:3001";
const API_KEY = process.env.API_KEY || "";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) h["Authorization"] = `Bearer ${API_KEY}`;
  return h;
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
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
```

- [ ] **Step 2: Rewrite services.ts to match actual backend routes**

Fix URL patterns to match real backend routes:
```typescript
import type { Venture, Skill, Contact, Deal, AgentLog } from "@/types";
import { factoryApi, contactApi, agentApi } from "./api";

export const ventures = {
  list: () => factoryApi.get<Venture[]>("/ventures"),
  get: (id: string) => factoryApi.get<Venture>(`/ventures/${id}`),
  create: (data: Pick<Venture, "name" | "slug" | "description">) => factoryApi.post<Venture>("/ventures", data),
  update: (id: string, data: Partial<Venture>) => factoryApi.patch<Venture>(`/ventures/${id}`, data),
  delete: (id: string) => factoryApi.delete<void>(`/ventures/${id}`),
};

export const skills = {
  list: (ventureId?: string) => factoryApi.get<Skill[]>(ventureId ? `/skills?venture_id=${ventureId}` : "/skills"),
  get: (id: string) => factoryApi.get<Skill>(`/skills/${id}`),
  create: (data: { ventureId: string; name: string; slug: string; description?: string }) => factoryApi.post<Skill>("/skills", data),
  delete: (id: string) => factoryApi.delete<void>(`/skills/${id}`),
};

export const contacts = {
  list: (ventureId: string) => contactApi.get<Contact[]>(`/contacts?venture_id=${ventureId}`),
  get: (id: string) => contactApi.get<Contact>(`/contacts/${id}`),
  create: (data: { ventureId: string; firstName: string; lastName: string; email?: string; phone?: string; company?: string }) =>
    contactApi.post<Contact>("/contacts", data),
  delete: (id: string) => contactApi.delete<void>(`/contacts/${id}`),
};

export const deals = {
  list: (ventureId: string) => contactApi.get<Deal[]>(`/deals?venture_id=${ventureId}`),
  create: (data: { ventureId: string; contactId: string; title: string; stage?: string; value?: number }) =>
    contactApi.post<Deal>("/deals", data),
  update: (id: string, data: Partial<Deal>) => contactApi.patch<Deal>(`/deals/${id}`, data),
};

export const agentLogs = {
  list: (ventureId: string) => factoryApi.get<AgentLog[]>(`/logs?venture_id=${ventureId}`),
};

export const execute = {
  run: (skill: string, ventureId: string, context: Record<string, unknown>) =>
    agentApi.post<{ success: boolean; output: unknown }>("/execute", { skill, venture_id: ventureId, context }),
};
```

- [ ] **Step 3: Commit**

```bash
git add ventures/kitz/src/lib/api.ts ventures/kitz/src/lib/services.ts
git commit -m "feat: rewrite API client for server-side fetching with correct routes"
```

**Important:** For client-side mutations (forms, delete buttons), use Next.js Server Actions that call `services.ts` server-side. Never import `api.ts` from a `"use client"` component.

---

### Task 2: Wire Ventures Page to Real Data

**Files:**
- Modify: `ventures/kitz/src/app/ventures/page.tsx`

- [ ] **Step 1: Replace hardcoded VENTURES with API fetch**

Replace the hardcoded `VENTURES` array with a server component fetch:
```typescript
import { api } from "@/lib/api";

export default async function VenturesPage() {
  const ventures = await api.get<Venture[]>("/api/factory/ventures");
  // ... render ventures from API data
}
```

- [ ] **Step 2: Add "New Venture" form**

Add a client component `CreateVentureForm` with name, slug, description fields that POSTs to `/api/factory/ventures`.

- [ ] **Step 3: Add delete button per venture**

Each venture card gets a delete button that calls `DELETE /api/factory/ventures/:id` with confirmation dialog.

- [ ] **Step 4: Commit**

```bash
git add ventures/kitz/src/app/ventures/
git commit -m "feat: wire ventures page to real API data with CRUD"
```

---

### Task 3: Wire Skills Page to Real Data

**Files:**
- Modify: `ventures/kitz/src/app/skills/page.tsx`

- [ ] **Step 1: Replace hardcoded SKILLS with API fetch**

```typescript
const skills = await api.get<Skill[]>("/api/factory/skills");
```

- [ ] **Step 2: Add venture filter dropdown**

Filter skills by venture using the `venture_id` query param.

- [ ] **Step 3: Add "Test Skill" button**

Each skill gets a "Test" button that opens a modal, lets the user enter context JSON, and POSTs to `/api/agent/execute` to run the skill. Shows the AI output.

- [ ] **Step 4: Commit**

```bash
git add ventures/kitz/src/app/skills/
git commit -m "feat: wire skills page to real API with test execution"
```

---

### Task 4: Wire Contacts Page to Real Data

**Files:**
- Modify: `ventures/kitz/src/app/contacts/page.tsx`

- [ ] **Step 1: Fetch contacts from contact-engine**

```typescript
const ventures = await api.get<Venture[]>("/api/factory/ventures");
const contacts = await api.get<Contact[]>(`/api/contacts/contacts?venture_id=${ventureId}`);
```

- [ ] **Step 2: Add "New Contact" form**

Client component with firstName, lastName, email, phone, company fields.

- [ ] **Step 3: Add venture selector**

Dropdown to switch which venture's contacts are displayed.

- [ ] **Step 4: Commit**

```bash
git add ventures/kitz/src/app/contacts/
git commit -m "feat: wire contacts page to real API with create form"
```

---

### Task 5: Wire Deals Page to Real Data

**Files:**
- Modify: `ventures/kitz/src/app/deals/page.tsx`

- [ ] **Step 1: Fetch deals from contact-engine**

```typescript
const deals = await api.get<Deal[]>(`/api/contacts/deals?venture_id=${ventureId}`);
```

- [ ] **Step 2: Render deals grouped by stage (kanban-like)**

Group deals by `stage` enum and display as columns.

- [ ] **Step 3: Add "New Deal" form**

Client component with title, contactId selector, stage, value fields.

- [ ] **Step 4: Commit**

```bash
git add ventures/kitz/src/app/deals/
git commit -m "feat: wire deals page to real API with stage grouping"
```

---

### Task 6: Wire Dashboard Metrics to Real Data

**Files:**
- Modify: `ventures/kitz/src/app/page.tsx`

- [ ] **Step 1: Fetch real counts for dashboard metrics**

```typescript
const ventures = await api.get<Venture[]>("/api/factory/ventures");
const skills = await api.get<Skill[]>("/api/factory/skills");
// Use array lengths for metric cards
```

- [ ] **Step 2: Show recent agent activity from logs**

Fetch from agent_logs (requires adding a `/logs` route to factory-api first — or query via a new endpoint).

- [ ] **Step 3: Commit**

```bash
git add ventures/kitz/src/app/page.tsx
git commit -m "feat: wire dashboard metrics to real API data"
```

---

### Task 7: Wire Logs Page

**Files:**
- Modify: `ventures/kitz/src/app/logs/page.tsx`
- Modify: `services/factory-api/src/routes/` (add logs route)

- [ ] **Step 1: Add agent logs route to factory-api**

Create `services/factory-api/src/routes/logs.ts`:
```typescript
app.get<{ Querystring: { venture_id?: string } }>("/", async (req) => {
  const where = req.query.venture_id ? { ventureId: req.query.venture_id } : {};
  return db.agentLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
});
```

Register in `server.ts`: `app.register(logRoutes, { prefix: "/logs" });`

- [ ] **Step 2: Wire logs page to fetch from API**

- [ ] **Step 3: Commit**

```bash
git add services/factory-api/src/routes/logs.ts services/factory-api/src/server.ts ventures/kitz/src/app/logs/
git commit -m "feat: add agent logs endpoint and wire logs page"
```

---

### Task 8: Deploy KitZ Dashboard

- [ ] **Step 1: Set env vars on kitz-web Railway service**

```bash
railway service kitz-web
railway variables set "FACTORY_API_URL=https://factory-api-production-5486.up.railway.app"
railway variables set "CONTACT_ENGINE_URL=https://contact-engine-production-a41e.up.railway.app"
railway variables set "AGENT_RUNTIME_URL=https://agent-runtime-production-ac7b.up.railway.app"
railway variables set "API_KEY=<same-key-from-phase1>"
```

- [ ] **Step 2: Push and deploy**

```bash
git push origin main
railway service kitz-web
railway up --detach
```

- [ ] **Step 3: Verify all pages load with real data**

Visit each page and confirm data comes from the live API, not hardcoded arrays.

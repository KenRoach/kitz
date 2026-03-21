# Flow Workspace MVP — Design Spec

**Date:** 2026-03-20
**Status:** Draft (v2 — post-review)
**Author:** Kenneth (founder) + Claude

## Problem

Kenneth needs 5 VARs (Value Added Resellers) to use RenewFlow as a self-service product, with room to grow beyond 5. Today RenewFlow exists as a standalone Vite app (`renewflo/`) with no auth, no multi-tenancy, and no onboarding. VARs cannot sign up or access their own workspace.

## Solution

Build **Flow** — a workspace shell inside the existing KitZ factory app (`ventures/kitz/`) that provides auth, onboarding, a scoped dashboard, and embeds the full `renewflo/` app as the RenewFlow product page. Backend is `kitz_gateway_ts` with additions for self-service registration, data scoping middleware, and CSV import. Frontends deployed on **Vercel**.

## Architecture

```
KitZ (OS) — ventures/kitz/
└── /flow                    — Flow workspace (own layout, no admin sidebar)
    ├── /flow/login          — Partner login
    ├── /flow/register       — Self-service signup
    ├── /flow/onboarding     — 3-step onboarding wizard
    ├── /flow/dashboard      — VAR's scoped metrics
    └── /flow/renewflow      — iframe embedding renewflo/ app

kitz_gateway_ts              — Backend (Railway, with additions listed below)
renewflo/                    — Standalone Vite app (minimal changes for auth handoff, deployed on Vercel)
```

## User Journey

```
VAR lands on /flow →
  /flow/register — email, password, company name →
  /flow/onboarding/1 — confirm company info →
  /flow/onboarding/2 — upload devices CSV →
  /flow/onboarding/3 — done, workspace ready →
  /flow/dashboard — scoped metrics →
  Click "RenewFlow" → /flow/renewflow — full renewflo/ experience (iframe)
```

## Scope

### What gets built

#### 1. Flow shell (frontend — `ventures/kitz/app/flow/`)

New route group under `/flow` with its **own layout** (NOT the admin sidebar). Uses Next.js App Router layout nesting: `app/flow/layout.tsx` provides the Flow-specific sidebar, completely independent of the KitZ admin layout.

**Flow sidebar:**
- Flow logo/branding
- Dashboard link
- RenewFlow product link
- Account/logout

**Pages:**
- `/flow/login` — email + password form, calls `POST /v0.1/auth/login` (existing endpoint)
- `/flow/register` — email + password + company name form, calls new `POST /v0.1/auth/register-var`
- `/flow/onboarding` — 3-step wizard (company info → CSV upload → done)
- `/flow/dashboard` — scoped metrics cards using `get_asset_metrics` and `generate_insights` gateway tools. Shows: active devices, revenue at risk, TPM savings, renewal rate.
- `/flow/renewflow` — iframe embedding the deployed `renewflo/` Vite app

**Scalability note:** The Flow shell architecture supports future users beyond the initial 5 VARs — auth, onboarding, and data scoping are user-agnostic by design.

#### 2. Gateway additions (`kitz_gateway_ts`)

**New endpoint:** `POST /v0.1/auth/register-var`
- Input: `{ email, password, company_name }`
- Uses Supabase Auth `db.auth.admin.createUser()` for password handling (already hashed by Supabase)
- Creates a `core_org` row with `company_name`
- Creates a `core_user` row linked to the org
- Returns JWT token (same format as existing `/v0.1/auth/login`)

**New middleware:** Auth + data scoping on tool routes
- `validateToken()` middleware on `/v0.1/tools/:name/invoke`
- Extracts `org_id` from JWT and injects it into every tool call automatically
- VARs cannot query across tenants — `org_id` is enforced server-side, not passed by the client

**Extend existing:** `add_assets` tool in `assets.ts`
- Add bulk import mode: accept array of asset rows from CSV
- Scoped to the authenticated VAR's `org_id`

#### 3. renewflo/ app changes (minimal)

Small addition (~10 lines) to support iframe auth handoff:
- Add a `window.addEventListener("message", ...)` listener in the app entry point
- When a `postMessage` with an auth token is received, store it in `localStorage` as `rf_token` (the key renewflo already reads from in `services/gateway.ts`)
- No other changes — all 9 features remain as-is

**All 9 features preserved:**
- Dashboard (portfolio overview, metrics, pipeline)
- Quoter (TPM + OEM quote generation)
- Orders (purchase order management)
- Inbox (email)
- Import (Excel/CSV asset import)
- Notifications (warranty expiry alerts)
- Support (ticket management)
- Rewards (partner gamification)
- Chat (AI chat with Claude)

### What does NOT get built

- No Cmd+K command palette
- No component porting or style conversion
- No new Next.js project (routes added to existing ventures/kitz/)
- No @kitz/ui extensions
- No theme system changes
- No admin panel for Kenneth (manage VARs via gateway DB for MVP)

## Deployment

| Service | Platform | Domain | Config needed |
|---------|----------|--------|---------------|
| `ventures/kitz/` (Flow shell) | **Vercel** | TBD (e.g. flow.kitz.services) | Monorepo root dir config, pnpm install |
| `renewflo/` (RenewFlow app) | **Vercel** | TBD (e.g. app.renewflow.io) | `vercel.json` with `frame-ancestors` header |
| `kitz_gateway_ts` (backend) | **Railway** (existing) | existing Railway URL | Update `CORS_ORIGIN` to include both Vercel domains |

### iframe headers (required)

The `renewflo/` Vercel deployment needs a `vercel.json` with:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://flow.kitz.services"
        }
      ]
    }
  ]
}
```

The gateway's `frameAncestors: ["'none'"]` in `src/index.ts` does NOT need changing — only `renewflo/` is embedded, not the gateway.

### CORS update

Add the `renewflo/` Vercel domain (e.g. `app.renewflow.io`) and the Flow shell domain (e.g. `flow.kitz.services`) to the gateway's `CORS_ORIGIN` env var on Railway.

## Technical Details

### Auth flow

1. VAR registers → gateway creates Supabase Auth user + `core_org` + `core_user` → returns JWT
2. JWT stored in browser (localStorage)
3. Flow shell includes JWT in all gateway API calls
4. When loading `/flow/renewflow`, the shell passes the JWT to the iframe via `window.postMessage` (origin-checked)
5. `renewflo/` app receives the token via message listener, stores as `rf_token` in localStorage
6. All renewflo API calls include the token; gateway's new auth middleware extracts `org_id` and scopes data

### iframe integration

```
Flow shell (Vercel)                  renewflo/ (Vercel, iframe)
┌─────────────────────┐              ┌─────────────────────┐
│ Flow sidebar        │              │ full renewflo app   │
│ (own layout, NOT    │              │                     │
│  admin sidebar)     │              │                     │
│                     │              │                     │
│ <iframe             │──postMessage──▶ receives auth token │
│   src="app.         │              │ stores in           │
│   renewflow.io"     │              │ localStorage        │
│ />                  │              │ scopes all API calls│
└─────────────────────┘              └─────────────────────┘
```

### Data scoping (new — does not exist today)

The gateway currently has NO auth middleware on tool routes. This must be added:

1. New middleware on `/v0.1/tools/:name/invoke` that calls `validateToken()`
2. Extracts `org_id` from the JWT payload
3. Injects `org_id` into the tool args automatically (server-side)
4. Tools filter all queries by `org_id` — VARs see only their own data
5. This is enforced at the gateway level, not the client — no VAR can bypass it

### CSV import during onboarding

Onboarding step 2: simple file upload form. Parses CSV client-side, sends rows to the gateway's `add_assets` tool (extended with bulk mode). Assets are automatically scoped to the VAR's `org_id` via the auth middleware.

**Expected CSV columns:** serial, model, vendor, warranty_end (confirm with Kenneth)

## Success Criteria

1. A VAR can self-register at `/flow/register`
2. A VAR can complete onboarding (company info + CSV upload)
3. A VAR sees their scoped dashboard at `/flow/dashboard`
4. A VAR can access all RenewFlow tools at `/flow/renewflow`
5. 5+ VARs can use Flow simultaneously with isolated data
6. Kenneth can demo the full journey to prospects

## Open Questions

1. What CSV columns should the device import expect? (serial, model, vendor, warranty_end — confirm with Kenneth)
2. Custom domain for Flow — `flow.kitz.services` or something else?

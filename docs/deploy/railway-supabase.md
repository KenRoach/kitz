# Deploying KitZ to Railway + Supabase

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │           Supabase                    │
                    │  ┌──────────┐  ┌──────────────────┐ │
                    │  │ Postgres │  │ Auth (redirects)  │ │
                    │  └────┬─────┘  └──────────────────┘ │
                    └───────┼──────────────────────────────┘
                            │ DATABASE_URL
          ┌─────────────────┼─────────────────────────────┐
          │                 │        Railway               │
          │                 │                              │
          │  ┌──────────────▼───────────┐                  │
          │  │    kitz-gateway :8787    │◄── CORS_ORIGIN   │
          │  │  (Fastify, WhatsApp,     │                  │
          │  │   AI tools, partner      │                  │
          │  │   portal, migrations)    │                  │
          │  └──────┬───────────────────┘                  │
          │         │ internal network                     │
          │  ┌──────▼──────┐ ┌──────────────┐             │
          │  │ factory-api │ │ agent-runtime │             │
          │  │    :3000    │ │    :3001      │             │
          │  └─────────────┘ └──────────────┘             │
          │  ┌──────────────┐ ┌──────────────┐            │
          │  │pipeline-runner│ │contact-engine│            │
          │  │    :3002     │ │    :3003     │             │
          │  └──────────────┘ └──────────────┘             │
          │  ┌──────────────┐                              │
          │  │channel-router│                              │
          │  │    :3004     │                              │
          │  └──────────────┘                              │
          │                                                │
          │  ┌──────────────┐ ┌──────────────┐            │
          │  │  kitz-web    │ │  renewflo     │            │
          │  │ (Next.js)    │ │ (Vite+proxy)  │            │
          │  │   :3000      │ │   :3000       │            │
          │  └──────────────┘ └──────────────┘            │
          └────────────────────────────────────────────────┘
```

## Prerequisites

- Railway account with a project created
- Supabase project with Postgres + Auth enabled
- GitHub repo connected to Railway

## Step 1: Supabase Setup

### Required Settings

1. **Auth Redirect URLs** — Add your Railway public URLs:
   ```
   https://kitz-web-production.up.railway.app/**
   https://renewflo-production.up.railway.app/**
   http://localhost:3000/**     (for dev)
   http://localhost:4000/**     (for dev)
   ```

2. **API Keys** — Note these from Supabase dashboard → Settings → API:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only, never expose to client)
   - Anon key — for client-side Supabase calls (if used in KitZ Next)

3. **Database URL** — Settings → Database → Connection string
   - Use the **pooled connection** (port 6543) for app connections
   - Use the **direct connection** (port 5432) for migrations only

### Same project for everything

Gateway, factory-api, and all services share one Supabase project. The gateway runs SQL migrations on startup; Prisma migrations run via `pnpm db:migrate:deploy`.

## Step 2: Railway Services

### Option A: Railway Dashboard (recommended for first deploy)

Create 8 services manually in Railway:

| Service | Dockerfile | Root Dir | Port | Public? |
|---------|-----------|----------|------|---------|
| kitz-gateway | `Dockerfile` | `/` | 8787 | Yes |
| factory-api | `docker/Dockerfile.service` | `/` | 3000 | Yes |
| agent-runtime | `docker/Dockerfile.service` | `/` | 3001 | No |
| pipeline-runner | `docker/Dockerfile.service` | `/` | 3002 | No |
| contact-engine | `docker/Dockerfile.service` | `/` | 3003 | Yes |
| channel-router | `docker/Dockerfile.service` | `/` | 3004 | No |
| kitz-web | `docker/Dockerfile.kitz-next` | `/` | 3000 | Yes |
| renewflo | `docker/Dockerfile.renewflo` | `/` | 3000 | Yes |

For services using `docker/Dockerfile.service`, set the build arg:
```
SERVICE=factory-api    # (or agent-runtime, contact-engine, etc.)
```

### Option B: Railway CLI

```bash
railway link
# Then for each service, use railway.json config
```

### Option C: `railway.json` (checked in)

The repo includes `railway.json` with all 8 services pre-configured. Import it from the Railway dashboard.

## Step 3: Environment Variables

See `.env.railway.example` for the full list. Key setup:

### Project-level (shared by all services)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
```

### kitz-gateway specific
```
PARTNER_TOKEN_SECRET=<openssl rand -hex 32>
CORS_ORIGIN=https://kitz-web-xxx.up.railway.app,https://renewflo-xxx.up.railway.app
AUTH_ENABLED=true
APP_URL=https://renewflo-xxx.up.railway.app
```

### renewflo specific
```
GATEWAY_URL=http://kitz-gateway.railway.internal:8787
```
Uses Railway **private networking** — the proxy talks to gateway over the internal network, not the public internet.

### kitz-web build args
```
NEXT_PUBLIC_API_BASE=https://factory-api-xxx.up.railway.app
NEXT_PUBLIC_GATEWAY_URL=https://kitz-gateway-xxx.up.railway.app
```
These are build-time args — set them in Railway's build settings.

## Step 4: Deploy

1. Push to `main` — Railway auto-deploys from GitHub.
2. Or manually trigger: `railway up` from CLI.

### First deploy order

Deploy in this order to avoid dependency issues:

1. **kitz-gateway** — runs DB migrations on startup
2. **factory-api** — needs DATABASE_URL
3. **agent-runtime, contact-engine, pipeline-runner, channel-router** — need DATABASE_URL
4. **kitz-web** — needs factory-api and gateway URLs at build time
5. **renewflo** — needs gateway URL at runtime

## Step 5: Post-Deploy Verification

```bash
# Gateway
curl https://kitz-gateway-xxx.up.railway.app/health

# Factory API
curl https://factory-api-xxx.up.railway.app/health

# RenewFlow (proxy test)
curl https://renewflo-xxx.up.railway.app/api/health

# KitZ Next
curl -s https://kitz-web-xxx.up.railway.app/ | head -5

# Seed skills
FACTORY_URL=https://factory-api-xxx.up.railway.app pnpm seed:skills
```

## Step 6: Custom Domains (Optional)

In Railway dashboard per service:
- kitz-web → `admin.kitz.io`
- renewflo → `app.renewflow.io` or `www.renewflow.io`
- kitz-gateway → `api.renewflow.io`

Update `CORS_ORIGIN` after adding custom domains.

## RenewFlow Proxy Architecture

The RenewFlow SPA makes API calls to `/api/*` (same-origin). On Railway, a small Fastify server (`renewflo/server/index.mjs`) handles this:

```
Browser → /api/tools → renewflo Fastify proxy → kitz-gateway:8787/v0.1/tools
Browser → /dashboard  → renewflo Fastify → serves dist/index.html (SPA)
```

This replaces Vercel's serverless `api/gateway-proxy.ts` with a long-running Node process.

## Networking

- **Public services**: kitz-gateway, factory-api, contact-engine, kitz-web, renewflo — get Railway public URLs
- **Internal services**: agent-runtime, pipeline-runner, channel-router — only accessible via Railway private network (`*.railway.internal`)
- **RenewFlow proxy**: uses `GATEWAY_URL=http://kitz-gateway.railway.internal:8787` (private network, no internet hop)

## Rollback

Railway supports instant rollbacks:
```bash
railway rollback --service kitz-gateway
```
Or use the dashboard: Service → Deployments → click the previous deploy → Rollback.

## Vercel (Optional Appendix)

If you want to keep Vercel as an option for frontends:
- `ventures/kitz` works on Vercel without changes (Next.js App Router)
- `renewflo` needs `vercel.json` with rewrites: `{ "rewrites": [{ "source": "/api/:path*", "destination": "GATEWAY_URL/v0.1/:path*" }] }`
- Backend services cannot run on Vercel (long-running processes)

# KitZ — Tu Asistente Personal de Negocios

AI-powered business assistant for small business owners in Latin America. Manage sales, expenses, inventory, customers, and reports — all through WhatsApp.

**Live site:** [kenroach.github.io/kitz](https://kenroach.github.io/kitz/)

## Tool Gateway (v0.1)

A lightweight HTTP gateway that exposes a tiny registry of callable tools.

## Features

- Versioned API (`/v0.1`)
- Built-in tools:
  - `echo`
  - `utc_now`
  - `sum`
- JSON request/response protocol
- Zero runtime dependencies (Python standard library only)

## Run

```bash
python -m kitz_gateway.cli --host 0.0.0.0 --port 8787
```

Or after install:

```bash
kitz-gateway --host 0.0.0.0 --port 8787
```

## API

### Health

```bash
curl -s http://127.0.0.1:8787/v0.1/health
```

### List tools

```bash
curl -s http://127.0.0.1:8787/v0.1/tools
```

### Invoke a tool

```bash
curl -s -X POST \
  http://127.0.0.1:8787/v0.1/tools/sum/invoke \
  -H 'content-type: application/json' \
  -d '{"args":{"numbers":[1,2,3.5]}}'
```

## Development

```bash
python -m pytest -q
```

## Deployment

**Platform:** Railway (backend + frontends) + Supabase (Postgres + Auth)

See **[docs/deploy/railway-supabase.md](docs/deploy/railway-supabase.md)** for the full deployment guide.

| Service | Dockerfile | Port |
|---------|-----------|------|
| kitz-gateway | `Dockerfile` | 8787 |
| factory-api | `docker/Dockerfile.service` | 3000 |
| agent-runtime | `docker/Dockerfile.service` | 3001 |
| pipeline-runner | `docker/Dockerfile.service` | 3002 |
| contact-engine | `docker/Dockerfile.service` | 3003 |
| channel-router | `docker/Dockerfile.service` | 3004 |
| kitz-web (Next.js) | `docker/Dockerfile.kitz-next` | 3000 |
| renewflo (Vite+proxy) | `docker/Dockerfile.renewflo` | 3000 |

Env vars: see `.env.railway.example`

## Production & Ops Docs

| Doc | Description |
|-----|-------------|
| [docs/deploy/railway-supabase.md](docs/deploy/railway-supabase.md) | Railway + Supabase deployment guide |
| [docs/friday-database.md](docs/friday-database.md) | Backup → migrate → sanity check → rollback runbook |
| [docs/friday-ops.md](docs/friday-ops.md) | Friday pre-traffic checklist |
| [docs/production/02-database.md](docs/production/02-database.md) | Production database reference |
| [docs/production/06-observability.md](docs/production/06-observability.md) | Logging, Sentry, health checks |
| [docs/happy-path-checklist.md](docs/happy-path-checklist.md) | Manual walkthrough for RenewFlow + KitZ |
| [docs/support-and-oncall.md](docs/support-and-oncall.md) | On-call ownership, escalation, triage |

### Scripts

```bash
pnpm happy-path          # API smoke test (needs GATEWAY_URL, HAPPY_PATH_EMAIL, HAPPY_PATH_PASSWORD)
pnpm seed:skills         # Register skills in factory DB (needs FACTORY_URL)
pnpm production-verify   # Check all required docs/scripts exist
pnpm db:migrate:deploy   # Apply pending Prisma migrations (prod)
```

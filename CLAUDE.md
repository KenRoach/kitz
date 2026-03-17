# KitZ — Company Factory OS

KitZ is an AI-native company factory that launches and operates portfolio ventures (companies).
Each venture gets its own agents, skills, pipelines, contacts, and deal flow — all managed
through a shared runtime and API layer.

## Repository Layout

```
kitz/
├── packages/              # Shared libraries (monorepo)
│   ├── core/              # Config loader, logger, env utilities
│   └── ui/                # Shared UI components, design tokens
├── services/              # Backend microservices
│   ├── factory-api/       # REST API for ventures, skills, CRUD
│   ├── agent-runtime/     # Executes AI skills per venture
│   ├── channel-router/    # Routes inbound messages to correct venture
│   ├── contact-engine/    # Contact/deal lifecycle management
│   └── pipeline-runner/   # Job queue for multi-step pipelines
├── ventures/              # Per-venture Next.js frontends
│   ├── kitz/              # KitZ admin dashboard
│   └── renewflow/         # RenewFlow venture frontend
├── skills/                # AI prompt templates (markdown)
│   ├── kitz/              # KitZ-level skills (sales, onboarding, retention, content)
│   └── renewflow/         # RenewFlow skills (tpm-quote, oem-quote, renewal-alert)
├── renewflo/              # RenewFlow standalone React app (Vite)
├── kitz_gateway/          # Legacy Python gateway (FastAPI)
├── kitz_gateway_ts/       # Production TypeScript gateway (Fastify)
├── kitz-academy/          # Training/education portal
├── prisma/                # Database schema (PostgreSQL)
├── docs/                  # Design specs and plans
└── .github/workflows/     # CI pipeline
```

## Active Ventures

| Venture | Slug | Description |
|---------|------|-------------|
| KitZ | `kitz` | The factory itself — admin, venture management, analytics |
| Flow | `renewflow` | AI warranty renewal platform for LATAM IT channel partners (product: RenewFlow) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Backend | TypeScript, Fastify, Node.js 20+ |
| Frontend | React 19, Next.js, Vite, Zustand |
| Database | PostgreSQL (Prisma ORM) |
| AI/LLM | Anthropic Claude API, structured output |
| Messaging | WhatsApp (Baileys), Email (SMTP) |
| Queue | BullMQ / custom pipeline runner |
| Deploy | Railway, Docker |

## Key Commands

```bash
# Monorepo (root)
pnpm dev                    # Start all services via Turborepo
pnpm build                  # Build all packages + services
pnpm lint                   # Lint everything
pnpm typecheck              # Type-check everything
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to database
pnpm db:migrate             # Run Prisma migrations

# Gateway (kitz_gateway_ts/)
cd kitz_gateway_ts && npm test    # Run gateway tests
cd kitz_gateway_ts && npx tsc --noEmit  # Type-check gateway

# RenewFlow (renewflo/)
cd renewflo && npm test           # Run RenewFlow tests
cd renewflo && npm run build      # Build RenewFlow
```

## Database

Prisma schema is at `prisma/schema.prisma`. Core models:
- **Venture** — a company in the portfolio (has slug, config JSON, status)
- **Agent** — AI agent assigned to a venture
- **Skill** — prompt template with input/output schemas, scoped to a venture
- **Pipeline** — multi-step automation workflow
- **Contact** — CRM contact scoped to a venture
- **Deal** — sales opportunity tied to a contact
- **Interaction** — message/email log per contact
- **AgentLog** — audit trail for skill executions

## Architecture Principles

- **Venture-scoped** — all data is isolated per venture via `ventureId` foreign keys
- **Skill-driven AI** — agents execute skills (prompt templates) with structured I/O
- **Pipeline orchestration** — multi-step workflows run as queued jobs
- **Channel-agnostic** — messages route through channel-router regardless of source
- **Monorepo discipline** — shared code in `packages/`, services are independent

## Conventions

- Environment variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `PORT`
- Venture configs stored as JSON in the `Venture.config` column
- Skills use `{{variable}}` template syntax in prompt markdown files
- All services expose `GET /health` returning `{ status: "ok", service: "<name>" }`
- TypeScript strict mode everywhere — no `any`

## When Working on a Specific Venture

Each venture may have its own `CLAUDE.md` with domain-specific context:
- `renewflo/CLAUDE.md` — RenewFlow business logic, pipeline stages, quoting rules
- `ventures/renewflow/` — RenewFlow Next.js frontend
- `ventures/kitz/` — KitZ admin frontend

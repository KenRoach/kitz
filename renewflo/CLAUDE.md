# RenewFlow

AI-Native Warranty Renewal Platform for LATAM IT Channel Partners

## What Is RenewFlow

RenewFlow is a SaaS platform that helps IT resellers and end-customer businesses in Latin America manage their installed base, automate warranty renewals, and sell OEM + third-party (TPM) warranty coverage profitably.

**Core problem:** IT resellers miss warranty renewals → equipment goes unprotected → money left on the table. RenewFlow automates the full renewal lifecycle from asset tracking to PO fulfillment.

**Market context:** LATAM IT services = $83.4B (2025), 78.1% partner-delivered. No existing tool combines warranty lifecycle automation + AI quoting + email-native delivery + PO handling + LATAM channel specialization.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript (strict), Vite, Zustand |
| Backend | TypeScript, Fastify (planned), Node.js 20+ |
| Database | PostgreSQL (Supabase), Redis |
| AI/LLM | Anthropic API (primary), structured output for quotes |
| Email | SMTP / transactional email (planned) |
| Excel/CSV | SheetJS (xlsx) for asset import/export |

## Project Structure

```
renewflo/
├── src/
│   ├── app/              # App entry, providers
│   ├── components/
│   │   ├── ui/           # Badge, Card, Pill, MetricCard, etc.
│   │   ├── layout/       # Sidebar, Shell
│   │   └── icons/        # SVG icon system
│   ├── features/         # Feature modules (vertical slices)
│   │   ├── dashboard/    # Portfolio overview, metrics, pipeline
│   │   ├── inbox/        # Email inbox
│   │   ├── quoter/       # TPM + OEM quote generator
│   │   ├── orders/       # Purchase order management
│   │   ├── import/       # Excel/CSV asset import (3-step)
│   │   ├── notifications/# Warranty expiry alerts
│   │   ├── support/      # Support ticket management
│   │   ├── rewards/      # Partner rewards/gamification
│   │   └── chat/         # AI chat panel (Claude API)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # External API services
│   ├── stores/           # Zustand state management
│   ├── theme/            # Design tokens, ThemeContext
│   ├── types/            # TypeScript domain types
│   ├── utils/            # Pure utility functions
│   └── data/             # Seed/mock data
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/
```

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # TypeScript check + production build
npm run type-check   # TypeScript only
npm run lint         # ESLint
npm run test         # Vitest
npm run test:watch   # Vitest watch mode
```

## Architecture Principles

- **Feature-based modules** — each feature is a vertical slice with its own components
- **TypeScript strict mode** — no `any`, no implicit returns
- **Zustand for state** — lightweight, no boilerplate
- **Theme system** — light/dark via React Context, design tokens
- **Enterprise single-app** — not a monorepo
- **Email-only communications** — no WhatsApp or messaging integrations

## Business Model

RenewFlow operates as a **broker/intermediary** between VARs and delivery partners:

```
VAR (user) ──→ RenewFlow ──→ Delivery Partner
               (broker)
```

- **VARs** manage their client installed base, generate quotes, and submit POs through RenewFlow
- **RenewFlow** manages all delivery partner relationships — VARs never deal with partners directly
- **Delivery Partners** receive POs from RenewFlow and fulfill warranty coverage

### Partner Integration Roadmap

| Phase | Channel | Description |
|-------|---------|-------------|
| MVP | Email POs | RenewFlow emails POs to delivery partners, tracks status |
| Phase 2 | Partner Portal | Delivery partners get read-only login to view/acknowledge POs |
| Phase 3 | API Integration | Programmatic PO submission and status updates |

## Business Logic

### Device Tier Classification

| Tier | Recommendation |
|------|---------------|
| Critical | OEM first (finance workstations, C-level laptops, servers) |
| Standard | TPM first — 30-60% savings |
| Low-use | TPM budget option |
| EOL | TPM only |

### Alert Schedule

| Days to Expiry | Priority |
|---------------|----------|
| 90 days | Medium — early awareness |
| 60 days | Medium — comparison quote |
| 30 days | High — decision time |
| 14 days | High — urgency |
| 7 days | Critical — human follow-up |
| 0 (lapsed) | High — recovery sequence |

### Pipeline Stages

```
discovered → alerted-90 → alerted-60 → alerted-30 → quoted →
  ├── tpm-approved → ordered → fulfilled
  ├── oem-approved → ordered → fulfilled
  ├── lost
  └── lapsed (recovery)
```

### Purchase Order Flow

```
VAR creates PO → pending-approval → approved → submitted (to RenewFlow) →
  RenewFlow routes to Delivery Partner → acknowledged → fulfilled
                                                       └→ cancelled
```

POs are generated from approved quotes and track:
- Line items (asset, coverage type, price, quantity)
- Client and vendor PO references
- Status through fulfillment lifecycle
- Delivery partner assignment (managed by RenewFlow)

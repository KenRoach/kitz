# KitZ — Company Factory OS Admin Dashboard

The control plane for the entire KitZ company factory. From here, operators
create ventures, configure agents, deploy skills, monitor pipelines, and
track cross-venture analytics.

## Tech Stack

- Next.js 14 (App Router) on port 4000
- TypeScript strict
- Tailwind CSS
- `@kitz/ui` shared component library
- Consumes `factory-api` REST service

## Project Structure

```
ventures/kitz/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Dashboard — factory-wide metrics
│   │   ├── ventures/       # Venture list, detail, create
│   │   ├── agents/         # Agent management per venture
│   │   ├── skills/         # Skill template CRUD
│   │   ├── pipelines/      # Pipeline builder and monitoring
│   │   ├── contacts/       # Cross-venture CRM
│   │   ├── deals/          # Sales pipeline visualization
│   │   └── logs/           # Agent execution audit trail
│   ├── components/
│   │   ├── layout/         # Sidebar, Shell
│   │   └── ui/             # StatusBadge, MetricCard
│   ├── lib/                # API client and service layer
│   └── types/              # Domain type definitions (Venture, Agent, Skill, etc.)
└── public/
```

## Commands

```bash
npm run dev       # Next.js dev server (port 4000)
npm run build     # Production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
```

## API Endpoints (factory-api)

| Method | Path | Description |
|--------|------|-------------|
| GET | /ventures | List all ventures |
| POST | /ventures | Create a venture |
| GET | /ventures/:id | Venture detail |
| GET | /skills?ventureId= | Skills for a venture |
| POST | /skills | Create a skill |
| GET | /ventures/:id/agents | Agents for a venture |
| GET | /ventures/:id/pipelines | Pipelines for a venture |
| GET | /ventures/:id/contacts | Contacts for a venture |
| GET | /ventures/:id/deals | Deals for a venture |
| GET | /ventures/:id/logs | Agent logs for a venture |

## Active Ventures

| Venture | Slug | Company | Description |
|---------|------|---------|-------------|
| KitZ | `kitz` | KitZ | The factory itself |
| Flow | `renewflow` | Flow | AI warranty renewal platform (product: RenewFlow) |

## Naming Convention

- **Flow** is the company (venture)
- **RenewFlow** is the product name
- **KitZ** is both the factory and its own venture

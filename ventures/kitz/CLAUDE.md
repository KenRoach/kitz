# KitZ Admin Dashboard

Next.js frontend for managing the KitZ company factory.

## What This Is

The KitZ admin dashboard is the control plane for the entire factory OS.
From here, operators can create ventures, configure agents, deploy skills,
monitor pipelines, and track cross-venture analytics.

## Tech Stack

- Next.js (App Router)
- TypeScript strict
- Tailwind CSS + PostCSS
- `@kitz/ui` shared component library

## Key Screens (Planned)

- **Ventures** — list, create, configure, pause/archive ventures
- **Skills** — manage prompt templates per venture
- **Pipelines** — design and monitor multi-step automations
- **Contacts** — cross-venture CRM view
- **Analytics** — deal flow, agent performance, revenue per venture

## API

All data comes from the `factory-api` service:
- `GET /ventures` — list ventures
- `POST /ventures` — create venture
- `GET /ventures/:id` — venture detail
- `GET /skills?ventureId=` — skills for a venture
- `POST /skills` — create skill

## Commands

```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm run lint      # ESLint
```

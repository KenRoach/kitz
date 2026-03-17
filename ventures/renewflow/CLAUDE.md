# Flow — Venture Frontend (RenewFlow Product)

Next.js frontend for Flow's RenewFlow warranty renewal platform.

## What This Is

Flow is the company (venture). RenewFlow is the product — it helps LATAM IT
resellers manage warranty renewals. This is the Next.js version that connects
to the KitZ factory backend. For the standalone Vite/React app, see
`renewflo/CLAUDE.md` at the repo root.

## Tech Stack

- Next.js (App Router)
- TypeScript strict
- Tailwind CSS + PostCSS
- `@kitz/ui` shared component library

## Domain Context

See `renewflo/CLAUDE.md` for full business logic including:
- Device tier classification (Critical/Standard/Low-use/EOL)
- Alert schedule (90/60/30/14/7/0 days)
- Pipeline stages (discovered -> fulfilled/lost/lapsed)
- Purchase order flow
- Broker model (VAR -> RenewFlow -> Delivery Partner)

## Commands

```bash
npm run dev       # Next.js dev server
npm run build     # Production build
npm run lint      # ESLint
```

# KitZ Gateway (TypeScript)

Production gateway service — the brain of KitZ. Handles messaging, AI routing,
authentication, tools, and the partner portal.

## Architecture

```
src/
├── auth/          # JWT auth, login/register routes
├── brain/         # AI router — context builder, memory, system prompt
├── db/            # PostgreSQL client, migrations, schema, seeds
├── llm/           # LLM provider router and types
├── messaging/     # WhatsApp (Baileys) + message handler
├── onboarding/    # New user onboarding flow
├── routes/        # Partner portal, tools API
├── scheduler/     # Warranty expiry cron jobs
├── services/      # Mailer (SMTP)
└── tools/         # AI tool implementations
    ├── assets.ts, email.ts, inbox.ts, insights.ts
    ├── orders.ts, partners.ts, quoter.ts
    ├── registry.ts, rewards.ts, tickets.ts
    └── builtin.ts
```

## Commands

```bash
npm ci                    # Install dependencies
npx tsc --noEmit          # Type-check
npx vitest run            # Run tests
npm run dev               # Start dev server (if configured)
```

## Key Patterns

- Tools register via `registry.ts` and are available to the AI brain
- Brain builds context from conversation history + tool results
- Messages arrive via WhatsApp (Baileys) or API, routed through `handler.ts`
- Partner portal at `/partner-portal` gives delivery partners PO visibility

## Testing

Tests live in `tests/`. Run with `npx vitest run`.
- `mailer.test.ts` — email sending
- `registry.test.ts` — tool registry

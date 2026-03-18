# Production Database

PostgreSQL on Supabase. All services connect via `DATABASE_URL`.

## Schema Management

- Prisma schema lives at `prisma/schema.prisma`.
- Gateway also runs its own SQL migrations on startup (`kitz_gateway_ts/src/db/migrate.ts`).

## Commands

```bash
pnpm db:generate        # Regenerate Prisma client
pnpm db:push            # Push schema (dev only — no migration history)
pnpm db:migrate         # Create + apply migration (dev)
pnpm db:migrate:deploy  # Apply pending migrations (prod)
```

## Friday Deploy Procedure

See **[docs/friday-database.md](../friday-database.md)** for the full backup → migrate → sanity check → rollback runbook.

## Connection Pooling

Supabase provides a PgBouncer pool on port 6543. Use the pooled URL (`DATABASE_URL`) for application connections and the direct URL (port 5432) for migrations.

## Backups

- Supabase automatic daily backups (retained 7 days on free, 30 on Pro).
- PITR available on Pro plan — allows restore to any second.
- Manual dumps via `pg_dump` for extra safety before risky migrations.

# Friday Database — Migrate / Backup / Rollback

Pre-traffic checklist for database changes every Friday (or any deploy window).

## 1. Backup (Supabase)

1. Open **Supabase Dashboard → Settings → Backups**.
2. Confirm the latest automatic daily backup exists (or trigger a manual one).
3. Note the backup timestamp — you'll need it if you rollback.

```bash
# Alternatively, dump via pg_dump if you have direct access:
pg_dump "$DATABASE_URL" --no-owner --clean > backup-$(date +%Y%m%d-%H%M).sql
```

## 2. Run Migrations on Production

```bash
# From monorepo root — uses Prisma under the hood
pnpm db:migrate:deploy
```

- This runs `prisma migrate deploy` which applies pending migrations only.
- It does **not** generate or create new migrations — safe for prod.

### Verify

```bash
# Check the migration table
psql "$DATABASE_URL" -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```

## 3. Sanity Checks

| Check | Command / Action |
|-------|-----------------|
| Gateway health | `curl https://<gateway-url>/health` |
| Tables exist | `psql "$DATABASE_URL" -c "\dt"` |
| Row counts sane | `psql "$DATABASE_URL" -c "SELECT count(*) FROM assets; SELECT count(*) FROM contacts;"` |
| App loads | Open RenewFlow dashboard, verify data renders |

## 4. Rollback Steps

If something breaks after migration:

1. **Pause apps** — Scale Railway services to 0 replicas or set them to sleep.
2. **Restore from backup** — Supabase Dashboard → Backups → Restore to the timestamp from step 1. Or if using PITR (Point-in-Time Recovery), pick the exact time before the migration ran.
3. **Redeploy previous image** — Roll back the Railway deploy to the last known-good commit.
4. **Verify** — Run the sanity checks from step 3 again.

```bash
# If using pg_dump backup instead of Supabase PITR:
psql "$DATABASE_URL" < backup-20260318-1200.sql
```

## 5. Post-Deploy

- Monitor logs for 15 minutes after migration.
- Check error rates in Railway metrics.
- Confirm no orphaned connections (Supabase → Database → Active connections).

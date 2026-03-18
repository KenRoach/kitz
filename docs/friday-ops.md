# Friday Ops Checklist

Quick pre-traffic checklist to run every Friday (or before any production deploy).

## 1. Code Freeze Window

- Merge only reviewed PRs before noon.
- No experimental branches to main after noon Friday.

## 2. Railway Services

- Confirm all services are healthy: gateway, channel-router, agent-runtime.
- Check memory/CPU — no runaway processes.

## 3. WhatsApp Session

- Verify WhatsApp adapter is connected (check gateway logs for `WhatsApp connected`).
- If session expired, re-scan QR from admin.

## 4. Scheduler

- Confirm warranty alert scheduler is running (`initWarrantyScheduler` log line on startup).
- Check last execution time in agent_logs.

## 5. Environment Variables

- No secrets expired or rotated without updating Railway.
- `PARTNER_TOKEN_SECRET`, `CORS_ORIGIN`, `ANTHROPIC_API_KEY` all set.

## 6. Database

**Full runbook:** [docs/friday-database.md](./friday-database.md)

- Backup confirmed in Supabase.
- `pnpm db:migrate:deploy` on prod.
- Sanity checks pass.

## 7. CI Must Be Green on Main

- Check [GitHub Actions](../../.github/workflows/ci.yml) — all jobs green.
- If CI is red, **fix before Friday traffic**. Do not deploy from a red main.
- The CI pipeline checks: gateway typecheck + tests, RenewFlow build + tests, KitZ Next build, Docker build.

## 8. Happy Path

- Walk through [docs/happy-path-checklist.md](./happy-path-checklist.md) on staging or prod.
- Optionally run `pnpm happy-path` for API smoke tests.

## 9. Support Rotation

- Confirm on-call assignments in [docs/support-and-oncall.md](./support-and-oncall.md).

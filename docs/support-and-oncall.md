# Support & On-Call

## Ownership Table

Fill in names/handles before Friday.

| Area | Owner | Backup | Slack/Contact |
|------|-------|--------|---------------|
| Login / Auth | Ken Roach | — | @kenroach |
| Gateway (Fastify) | Ken Roach | — | @kenroach |
| RenewFlow Frontend | Ken Roach | — | @kenroach |
| KitZ Admin Dashboard | Ken Roach | — | @kenroach |
| Database / Migrations | Ken Roach | — | @kenroach |
| Railway Deploys | Ken Roach | — | @kenroach |
| WhatsApp Integration | Ken Roach | — | @kenroach |
| AI / LLM (Anthropic) | Ken Roach | — | @kenroach |

## Escalation Path

1. **L1** — Check dashboards (Railway metrics, Supabase logs). Try the triage steps below.
2. **L2** — Page the area owner from the table above.
3. **L3** — If owner unreachable after 15 min, page backup. If both unreachable, post in #incidents.

## Quick Triage

### Gateway not responding

```bash
# Check health endpoint
curl -s https://<gateway-url>/health

# Check Railway logs
railway logs --service kitz-gateway --recent
```

- If health returns nothing: service is down — restart from Railway dashboard.
- If health returns but routes 500: check gateway logs for stack traces.

### Supabase / Database

```bash
# Check connection
psql "$DATABASE_URL" -c "SELECT 1;"
```

- Connection refused: check Supabase dashboard for outage or paused project.
- Slow queries: check Supabase → Database → Query Performance.

### CORS Errors in Browser

- Verify `CORS_ORIGIN` env var includes the requesting domain.
- Check browser console for the exact blocked origin.
- Update Railway env var and redeploy.

### WhatsApp Disconnected

- Check gateway logs for `WhatsApp disconnected` or `QR` events.
- Re-scan QR from admin if session expired.
- Restart gateway service if adapter won't reconnect.

## Incident Template

```
**Incident:** [short description]
**Severity:** P1/P2/P3
**Detected:** [timestamp]
**Impact:** [who/what is affected]
**Status:** Investigating / Mitigating / Resolved
**Owner:** [name]
**Updates:**
- [timestamp] — [update]
```

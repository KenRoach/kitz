# Observability

Structured logging and error tracking for the KitZ platform.

## Logging

### Gateway (Fastify)

Fastify uses `pino` structured JSON logging by default (`logger: true` in server config).

```jsonc
// Every request logs:
{ "level": 30, "time": 1711000000, "reqId": "abc", "req": { "method": "POST", "url": "/v0.1/tools/sum/invoke" }, "res": { "statusCode": 200 }, "responseTime": 12.5 }
```

**Log levels:**
- `fatal` (60) — process cannot continue
- `error` (50) — request failed, caught exception
- `warn` (40) — degraded but operational (e.g., SMTP not configured)
- `info` (30) — normal operations (startup, connections, scheduled jobs)
- `debug` (20) — verbose debugging (disabled in prod)

Set with `LOG_LEVEL` env var. Default: `info`.

### Railway

Railway captures stdout/stderr automatically. View logs:

```bash
railway logs --service kitz-gateway --recent
railway logs --service kitz-gateway --follow
```

Or use the Railway dashboard: **Project → Service → Logs**.

### Key Log Lines to Monitor

| Log Pattern | Meaning | Action |
|-------------|---------|--------|
| `KitZ(OS) Gateway v0.1 ready` | Server started successfully | None |
| `WhatsApp connected` | Baileys session active | None |
| `WhatsApp disconnected` | Session lost | Re-scan QR |
| `[migrate] Migration error` | DB migration failed | Check schema |
| `[warranty-scheduler] First run` | Scheduler started | None |
| `PARTNER_TOKEN_SECRET environment variable is required` | Missing env var | Set it in Railway |
| `SMTP_HOST is set but SMTP_USER...required` | Incomplete SMTP config | Set all SMTP vars |

## Error Tracking (Sentry)

### Setup

1. Create a Sentry project at https://sentry.io for `kitz-gateway`.
2. Install the SDK:

```bash
cd kitz_gateway_ts && npm install @sentry/node
```

3. Initialize in `src/index.ts` before server creation:

```typescript
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.1, // 10% of transactions
  });
}
```

4. Add Fastify error hook:

```typescript
app.addHook("onError", (request, reply, error, done) => {
  Sentry.captureException(error, {
    tags: { route: request.url, method: request.method },
    extra: { reqId: request.id },
  });
  done();
});
```

5. Set `SENTRY_DSN` in Railway env vars.

### RenewFlow Frontend

```bash
cd renewflo && npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}
```

## Health Checks

All services expose `GET /health`:

```bash
# Gateway
curl -s https://<gateway-url>/health
# → { "status": "ok", "service": "kitz-gateway" }
```

### Uptime Monitoring

Use a free uptime service (e.g., UptimeRobot, Better Uptime) to ping `/health` every 5 minutes. Alert on 2 consecutive failures.

## Metrics to Track

| Metric | Source | Target |
|--------|--------|--------|
| API response time (p95) | Fastify logs / Sentry | < 500ms |
| Error rate | Sentry | < 1% |
| WhatsApp session uptime | Gateway logs | > 99% |
| DB connection pool usage | Supabase dashboard | < 80% |
| Memory usage | Railway metrics | < 512MB |
| Warranty alerts sent/day | agent_logs table | Matches expiring assets |

## Agent Logs (Built-in)

Every skill execution is logged to the `agent_logs` table:

```sql
SELECT skill, count(*), avg(latency_ms)
FROM agent_logs
WHERE created_at > now() - interval '7 days'
GROUP BY skill
ORDER BY count(*) DESC;
```

This gives you skill-level usage and performance without external tooling.

## Alerting Checklist

- [ ] Sentry DSN configured for gateway
- [ ] Sentry DSN configured for RenewFlow frontend
- [ ] Uptime monitor on `/health` endpoint
- [ ] Railway notifications enabled for deploy failures
- [ ] Supabase alerts for connection limits

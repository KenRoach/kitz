# Phase 1: Critical Fixes — Backend Bugs, Auth, Validation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Agent Runtime UUID bug, add API-key auth middleware to all backend services, and add Zod input validation to all POST endpoints so the platform is secure and usable.

**Architecture:** Shared auth middleware in `packages/core` that all services import. Each service registers it as a Fastify plugin. Validation schemas co-located with routes. API keys stored as env var `API_KEY` on Railway, checked via `Authorization: Bearer <key>` header.

**Tech Stack:** Fastify hooks, Zod schemas, `@kitz/core` shared package

---

### Task 1: Fix Agent Runtime UUID Bug

**Files:**
- Modify: `services/agent-runtime/src/routes/execute.ts:14`

- [ ] **Step 1: Fix the validation schema**

Change line 14 from:
```typescript
venture_id: z.string().uuid(),
```
to:
```typescript
venture_id: z.string().min(1),
```

- [ ] **Step 2: Verify typecheck passes**

Run: `cd ~/kitz && npx tsc --project services/agent-runtime/tsconfig.json --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add services/agent-runtime/src/routes/execute.ts
git commit -m "fix: accept CUID venture IDs in agent-runtime execute endpoint"
```

---

### Task 2: Create Shared Auth Middleware in @kitz/core

**Files:**
- Create: `packages/core/src/middleware/auth.ts`
- Modify: `packages/core/src/index.ts` (add export)

- [ ] **Step 1: Create the auth middleware**

Create `packages/core/src/middleware/auth.ts`:
```typescript
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

const SKIP_PATHS = ["/health"];

export function registerAuth(app: FastifyInstance) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return; // Auth disabled if no API_KEY set

  app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    if (SKIP_PATHS.includes(request.url)) return;
    if (request.method === "OPTIONS") return;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Authorization required" });
    }

    const token = authHeader.slice(7);
    if (token !== apiKey) {
      return reply.status(401).send({ error: "Invalid API key" });
    }
  });
}
```

- [ ] **Step 2: Export from packages/core/src/index.ts**

Add to the exports in `packages/core/src/index.ts`:
```typescript
export { registerAuth } from "./middleware/auth.js";
```

- [ ] **Step 3: Add fastify as a peer dependency**

In `packages/core/package.json`, add to dependencies:
```json
"fastify": "^4.29.0"
```

- [ ] **Step 4: Verify typecheck passes**

Run: `cd ~/kitz && pnpm install && npx tsc --project packages/core/tsconfig.json --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/middleware/auth.ts packages/core/src/index.ts packages/core/package.json pnpm-lock.yaml
git commit -m "feat: add shared API-key auth middleware to @kitz/core"
```

---

### Task 3: Register Auth Middleware in All Services

**Files:**
- Modify: `services/factory-api/src/server.ts`
- Modify: `services/agent-runtime/src/server.ts`
- Modify: `services/contact-engine/src/server.ts`
- Modify: `services/pipeline-runner/src/server.ts`
- Modify: `services/channel-router/src/server.ts`

- [ ] **Step 1: Add registerAuth to each server.ts**

In each service's `server.ts`, after the `cors` registration, add:
```typescript
import { registerAuth } from "@kitz/core";
// ... after cors registration:
registerAuth(app);
```

Do this for all 5 services.

- [ ] **Step 2: Verify all services typecheck**

Run: `cd ~/kitz && pnpm typecheck`
Expected: No errors across all packages

- [ ] **Step 3: Commit**

```bash
git add services/*/src/server.ts
git commit -m "feat: register API-key auth middleware in all backend services"
```

---

### Task 4: Add Fastify as peerDependency (not dependency)

**Files:**
- Modify: `packages/core/package.json`

- [ ] **Step 1: Add fastify as peerDependency, not dependency**

In `packages/core/package.json`, add:
```json
"peerDependencies": {
  "fastify": "^4.0.0"
}
```

Do NOT add fastify to `dependencies` — each service provides its own Fastify instance.

- [ ] **Step 2: Install and verify**

```bash
cd ~/kitz && pnpm install && npx tsc --project packages/core/tsconfig.json --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add packages/core/package.json pnpm-lock.yaml
git commit -m "chore: add fastify as peerDependency in @kitz/core"
```

---

### Task 5: Add Zod Validation to Factory API

**Files:**
- Modify: `services/factory-api/src/routes/ventures.ts`
- Modify: `services/factory-api/src/routes/skills.ts`

- [ ] **Step 1: Add Zod schemas and validation to ventures.ts**

Add at top of `ventures.ts`:
```typescript
import { z } from "zod";
```

Add schemas:
```typescript
const CreateVenture = z.object({
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required").regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional().default(""),
});

const UpdateVenture = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  config: z.record(z.unknown()).optional(),
}).refine(data => Object.keys(data).length > 0, "At least one field required");
```

Wrap the POST handler body parsing:
```typescript
const parsed = CreateVenture.safeParse(req.body);
if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
const { name, slug, description } = parsed.data;
```

Wrap the PATCH handler body parsing:
```typescript
const parsed = UpdateVenture.safeParse(req.body);
if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
```

- [ ] **Step 2: Add Zod schemas and validation to skills.ts**

Add schemas:
```typescript
const CreateSkill = z.object({
  ventureId: z.string().min(1, "ventureId is required"),
  name: z.string().min(1, "name is required"),
  slug: z.string().min(1, "slug is required").regex(/^[a-z0-9-]+$/),
  description: z.string().optional().default(""),
});
```

Wrap POST handler:
```typescript
const parsed = CreateSkill.safeParse(req.body);
if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
```

- [ ] **Step 3: Verify typecheck passes**

Run: `cd ~/kitz && npx tsc --project services/factory-api/tsconfig.json --noEmit`

- [ ] **Step 4: Commit**

```bash
git add services/factory-api/src/routes/ventures.ts services/factory-api/src/routes/skills.ts
git commit -m "feat: add Zod input validation to factory-api routes"
```

---

### Task 6: Add Zod Validation to Contact Engine

**Files:**
- Modify: `services/contact-engine/src/routes/contacts.ts`
- Modify: `services/contact-engine/src/routes/deals.ts`
- Modify: `services/contact-engine/src/routes/interactions.ts`

- [ ] **Step 1: Add Zod schemas to contacts.ts**

```typescript
import { z } from "zod";

const CreateContact = z.object({
  ventureId: z.string().min(1),
  firstName: z.string().min(1, "firstName is required"),
  lastName: z.string().min(1, "lastName is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
});
```

Wrap POST handler with `CreateContact.safeParse(req.body)`.

- [ ] **Step 2: Add Zod schemas to deals.ts**

```typescript
const CreateDeal = z.object({
  ventureId: z.string().min(1),
  contactId: z.string().min(1),
  title: z.string().min(1, "title is required"),
  stage: z.enum(["identified", "contacted", "qualified", "quoted", "negotiation", "closed_won", "closed_lost"]).optional().default("identified"),
  value: z.number().min(0).optional().default(0),
  metadata: z.record(z.unknown()).optional().default({}),
});
```

Wrap POST handler with `CreateDeal.safeParse(req.body)`.

- [ ] **Step 3: Add Zod schemas to interactions.ts**

```typescript
const CreateInteraction = z.object({
  contactId: z.string().min(1),
  ventureId: z.string().min(1),
  channel: z.string().min(1),
  direction: z.string().min(1),
  content: z.string().min(1),
  metadata: z.record(z.unknown()).optional().default({}),
});
```

Wrap POST handler with `CreateInteraction.safeParse(req.body)`.

- [ ] **Step 4: Verify typecheck passes**

Run: `cd ~/kitz && npx tsc --project services/contact-engine/tsconfig.json --noEmit`

- [ ] **Step 5: Commit**

```bash
git add services/contact-engine/src/routes/*.ts
git commit -m "feat: add Zod input validation to contact-engine routes"
```

---

### Task 7: Add Missing DELETE Routes

**Files:**
- Modify: `services/factory-api/src/routes/ventures.ts`
- Modify: `services/factory-api/src/routes/skills.ts`
- Modify: `services/contact-engine/src/routes/contacts.ts`
- Modify: `services/contact-engine/src/routes/deals.ts`
- Modify: `services/contact-engine/src/routes/interactions.ts`

- [ ] **Step 1: Add DELETE to ventures.ts**

```typescript
app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
  const venture = await db.venture.findUnique({ where: { id: req.params.id } });
  if (!venture) return reply.notFound("Venture not found");
  await db.venture.delete({ where: { id: req.params.id } });
  return { deleted: true };
});
```

- [ ] **Step 2: Add DELETE to skills.ts**

```typescript
app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
  const skill = await db.skill.findUnique({ where: { id: req.params.id } });
  if (!skill) return reply.notFound("Skill not found");
  await db.skill.delete({ where: { id: req.params.id } });
  return { deleted: true };
});
```

- [ ] **Step 3: Add DELETE to contacts.ts**

```typescript
app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
  const contact = await db.contact.findUnique({ where: { id: req.params.id } });
  if (!contact) return reply.notFound("Contact not found");
  await db.contact.delete({ where: { id: req.params.id } });
  return { deleted: true };
});
```

- [ ] **Step 4: Add DELETE to deals.ts and interactions.ts**

Same pattern using `db.deal` and `db.interaction` respectively.

- [ ] **Step 3: Verify typecheck**

Run: `cd ~/kitz && pnpm typecheck`

- [ ] **Step 4: Commit**

```bash
git add services/factory-api/src/routes/*.ts services/contact-engine/src/routes/*.ts
git commit -m "feat: add DELETE endpoints to factory-api and contact-engine"
```

---

### Task 8: Add Missing GET-by-ID Routes

**Files:**
- Modify: `services/factory-api/src/routes/skills.ts`
- Modify: `services/contact-engine/src/routes/deals.ts`
- Modify: `services/contact-engine/src/routes/interactions.ts`

- [ ] **Step 1: Add GET /:id to skills.ts**

```typescript
app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
  const skill = await db.skill.findUnique({ where: { id: req.params.id } });
  if (!skill) return reply.notFound("Skill not found");
  return skill;
});
```

- [ ] **Step 2: Add GET /:id to deals.ts and interactions.ts**

Same pattern, adjusting model name.

- [ ] **Step 3: Commit**

```bash
git add services/factory-api/src/routes/skills.ts services/contact-engine/src/routes/deals.ts services/contact-engine/src/routes/interactions.ts
git commit -m "feat: add GET-by-ID routes for skills, deals, interactions"
```

---

### Task 9: Clean Up Audit Test Data + Push + Deploy

- [ ] **Step 1: Delete orphaned test data via SQL**

```bash
cd ~/kitz && pnpm --filter @kitz/core exec prisma db execute \
  --url "$DATABASE_URL" \
  --stdin <<'SQL'
DELETE FROM interactions WHERE venture_id NOT IN (SELECT id FROM ventures WHERE slug IN ('kitz','renewflow'));
DELETE FROM deals WHERE venture_id NOT IN (SELECT id FROM ventures WHERE slug IN ('kitz','renewflow'));
DELETE FROM contacts WHERE venture_id NOT IN (SELECT id FROM ventures WHERE slug IN ('kitz','renewflow'));
DELETE FROM skills WHERE venture_id NOT IN (SELECT id FROM ventures WHERE slug IN ('kitz','renewflow'));
DELETE FROM ventures WHERE slug NOT IN ('kitz','renewflow');
SQL
```

Note: Set `DATABASE_URL` from your Supabase direct connection string before running.

- [ ] **Step 2: Push all changes**

```bash
git push origin main
```

- [ ] **Step 3: Generate API_KEY and set on Railway + frontends**

```bash
cd ~/kitz
API_KEY=$(openssl rand -hex 32)
echo "SAVE THIS → API_KEY=$API_KEY"

for svc in factory-api agent-runtime contact-engine pipeline-runner channel-router kitz-web renewflow; do
  railway service "$svc"
  railway variables set "API_KEY=$API_KEY"
done

# Agent runtime also needs the Anthropic key for skill execution
railway service agent-runtime
railway variables set "ANTHROPIC_API_KEY=<your-anthropic-key>"
```

- [ ] **Step 4: Deploy all services**

```bash
for svc in factory-api agent-runtime contact-engine pipeline-runner channel-router; do
  railway service "$svc"
  railway up --detach
done
```

- [ ] **Step 5: Verify health + auth**

```bash
# Health should still work without auth:
curl -s https://factory-api-production-5486.up.railway.app/health
# API calls should require auth:
curl -s https://factory-api-production-5486.up.railway.app/ventures  # Should be 401
curl -s -H "Authorization: Bearer $API_KEY" https://factory-api-production-5486.up.railway.app/ventures  # Should be 200
```

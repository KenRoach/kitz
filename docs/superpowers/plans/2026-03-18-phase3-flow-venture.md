# Phase 3: Build Flow Venture — End-to-End Warranty Renewal Platform

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Flow (formerly RenewFlow) venture into a complete warranty renewal platform where an SMB operator can: import hardware assets from Excel, generate AI quotes (TPM vs OEM), manage deals through a pipeline, send renewal alerts via WhatsApp/email, and track POs to fulfillment.

**Architecture:** The Next.js frontend at `ventures/renewflow/` becomes the production Flow dashboard, pulling proven UI patterns from the Vite prototype at `renewflo/`. Backend uses existing KitZ services (factory-api for data, agent-runtime for AI quoting, contact-engine for CRM, channel-router for messaging). New "asset" model added to Prisma schema.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Prisma, Fastify, AI skills (tpm-quote, oem-quote, renewal-alert)

**Prerequisite:** Phase 1 and Phase 2 must be complete.

**Naming:** The venture slug remains `renewflow` in code. User-facing text says "Flow". The product name "RenewFlow" is used in marketing.

**Note:** The 3 AI skill templates (`tpm-quote.md`, `oem-quote.md`, `renewal-alert.md`) already exist in `skills/renewflow/` and are seeded in the database. The Flow venture (`renewflow`) already exists with ID from factory-api.

**Important:** The Flow Next.js app needs its own `next.config.mjs` and `src/lib/api.ts` with the same server-side fetching pattern as KitZ (Phase 2 Task 1). Copy and adapt from `ventures/kitz/`.

---

### Task 1: Add Asset Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Asset model**

```prisma
model Asset {
  id           String      @id @default(cuid())
  ventureId    String      @map("venture_id")
  contactId    String?     @map("contact_id")
  brand        String
  model        String
  serial       String
  deviceType   String?     @map("device_type")
  tier         String      @default("standard")
  warrantyEnd  DateTime?   @map("warranty_end")
  purchaseDate DateTime?   @map("purchase_date")
  status       String      @default("discovered")
  oem          Float?
  tpm          Float?
  quantity     Int         @default(1)
  metadata     Json        @default("{}")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  venture  Venture  @relation(fields: [ventureId], references: [id])
  contact  Contact? @relation(fields: [contactId], references: [id])

  @@unique([ventureId, serial])
  @@map("assets")
}
```

Add `assets Asset[]` relation to `Venture` and `Contact` models.

- [ ] **Step 2: Push schema to database**

```bash
cd ~/kitz && pnpm --filter @kitz/core exec prisma db push --url "postgresql://postgres:KhfgIiMrW1axkJ90@db.mjnywsngrtecsnkabkkh.supabase.co:5432/postgres"
```

- [ ] **Step 3: Regenerate Prisma client**

```bash
pnpm --filter @kitz/core exec prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Asset model to Prisma schema for Flow warranty tracking"
```

---

### Task 2: Add Asset Routes to Factory API

**Files:**
- Create: `services/factory-api/src/routes/assets.ts`
- Modify: `services/factory-api/src/server.ts`

- [ ] **Step 1: Create asset CRUD routes**

`services/factory-api/src/routes/assets.ts`:
```typescript
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getDB } from "@kitz/core";

const CreateAsset = z.object({
  ventureId: z.string().min(1),
  contactId: z.string().optional(),
  brand: z.string().min(1),
  model: z.string().min(1),
  serial: z.string().min(1),
  deviceType: z.string().optional(),
  tier: z.enum(["critical", "standard", "low-use", "eol"]).default("standard"),
  warrantyEnd: z.string().optional(),
  purchaseDate: z.string().optional(),
  oem: z.number().optional(),
  tpm: z.number().optional(),
  quantity: z.number().int().min(1).default(1),
  metadata: z.record(z.unknown()).optional().default({}),
});

const BulkImport = z.object({
  ventureId: z.string().min(1),
  assets: z.array(CreateAsset.omit({ ventureId: true })),
});

export const assetRoutes: FastifyPluginAsync = async (app) => {
  const db = getDB();

  // List assets by venture
  app.get<{ Querystring: { venture_id: string } }>("/", async (req, reply) => {
    if (!req.query.venture_id) return reply.badRequest("venture_id is required");
    return db.asset.findMany({
      where: { ventureId: req.query.venture_id },
      orderBy: { createdAt: "desc" },
    });
  });

  // Get single asset
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    return asset;
  });

  // Create single asset
  app.post("/", async (req, reply) => {
    const parsed = CreateAsset.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const data = parsed.data;
    return db.asset.create({
      data: {
        ...data,
        warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        metadata: data.metadata || {},
      },
    });
  });

  // Bulk import assets
  app.post("/bulk", async (req, reply) => {
    const parsed = BulkImport.safeParse(req.body);
    if (!parsed.success) return reply.badRequest(parsed.error.issues[0].message);
    const { ventureId, assets } = parsed.data;
    const created = await db.asset.createMany({
      data: assets.map(a => ({
        ventureId,
        ...a,
        warrantyEnd: a.warrantyEnd ? new Date(a.warrantyEnd) : null,
        purchaseDate: a.purchaseDate ? new Date(a.purchaseDate) : null,
        metadata: a.metadata || {},
      })),
      skipDuplicates: true,
    });
    return { imported: created.count };
  });

  // Update asset
  app.patch<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    return db.asset.update({ where: { id: req.params.id }, data: req.body as any });
  });

  // Delete asset
  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const asset = await db.asset.findUnique({ where: { id: req.params.id } });
    if (!asset) return reply.notFound("Asset not found");
    await db.asset.delete({ where: { id: req.params.id } });
    return { deleted: true };
  });
};
```

- [ ] **Step 2: Register in server.ts**

```typescript
import { assetRoutes } from "./routes/assets.js";
await app.register(assetRoutes, { prefix: "/assets" });
```

- [ ] **Step 3: Verify typecheck and commit**

```bash
cd ~/kitz && npx tsc --project services/factory-api/tsconfig.json --noEmit
git add services/factory-api/src/routes/assets.ts services/factory-api/src/server.ts
git commit -m "feat: add asset CRUD + bulk import routes to factory-api"
```

---

### Task 3: Build Flow Dashboard — Asset Import Page

**Files:**
- Create: `ventures/renewflow/src/app/assets/page.tsx`
- Create: `ventures/renewflow/src/app/assets/import/page.tsx`
- Create: `ventures/renewflow/src/components/asset-table.tsx`
- Create: `ventures/renewflow/src/components/import-wizard.tsx`
- Create: `ventures/renewflow/src/lib/api.ts`
- Modify: `ventures/renewflow/src/app/layout.tsx`

- [ ] **Step 1: Set up API client + layout with sidebar**

Port the sidebar navigation from `renewflo/` with pages: Dashboard, Assets, Quoter, Deals, Alerts.

- [ ] **Step 2: Build asset list page**

`/assets` page that fetches `GET /api/factory/assets?venture_id=<flow-venture-id>` and renders in a table with columns: Device, Serial, Client, Tier, Warranty End, Status, TPM, OEM.

- [ ] **Step 3: Build import wizard**

Port the 3-step import from `renewflo/src/features/import/ImportModule.tsx`:
1. Upload Excel/CSV (use SheetJS)
2. Map columns
3. Preview + confirm → POST `/api/factory/assets/bulk`

- [ ] **Step 4: Commit**

```bash
git add ventures/renewflow/
git commit -m "feat: build Flow asset management + Excel import wizard"
```

---

### Task 4: Build Flow Dashboard — Quote Generator

**Files:**
- Create: `ventures/renewflow/src/app/quoter/page.tsx`
- Create: `ventures/renewflow/src/components/quote-modal.tsx`

- [ ] **Step 1: Build quoter page**

Table of assets with checkboxes. Selected assets show TPM vs OEM totals and savings%.

- [ ] **Step 2: "Smart Quote" button calls agent-runtime**

When clicked, POST to `/api/agent/execute` with:
```json
{
  "skill": "tpm-quote",
  "venture_id": "<flow-venture-id>",
  "context": {
    "hardware_inventory": [selected assets],
    "client_name": "...",
    "country": "...",
    "language": "es"
  }
}
```

Display the AI response in a modal with the 3 pricing tiers.

- [ ] **Step 3: "Create Deal" button**

Creates a deal in contact-engine from the quote:
```json
POST /api/contacts/deals
{
  "ventureId": "...",
  "contactId": "...",
  "title": "Warranty Renewal - ClientName",
  "stage": "quoted",
  "value": totalAmount
}
```

- [ ] **Step 4: Commit**

```bash
git add ventures/renewflow/src/app/quoter/ ventures/renewflow/src/components/quote-modal.tsx
git commit -m "feat: build Flow quote generator with AI skill execution"
```

---

### Task 5: Build Flow Dashboard — Deal Pipeline

**Files:**
- Create: `ventures/renewflow/src/app/deals/page.tsx`

- [ ] **Step 1: Build kanban deal board**

Fetch deals from contact-engine, group by stage. Render as columns:
`identified → contacted → qualified → quoted → negotiation → closed_won / closed_lost`

- [ ] **Step 2: Allow stage updates via drag or dropdown**

PATCH `/api/contacts/deals/:id` with new stage.

- [ ] **Step 3: Commit**

```bash
git add ventures/renewflow/src/app/deals/
git commit -m "feat: build Flow deal pipeline kanban board"
```

---

### Task 6: Build Flow Dashboard — Renewal Alerts

**Files:**
- Create: `ventures/renewflow/src/app/alerts/page.tsx`

- [ ] **Step 1: Build alerts page**

Query assets where `warrantyEnd` is within 90 days. Group by urgency:
- Critical (7 days)
- Urgent (14 days)
- Important (30 days)
- Advisory (60 days)
- Informational (90 days)

- [ ] **Step 2: "Send Alert" button**

Runs the `renewal-alert` skill via agent-runtime, then sends the generated message via channel-router (`POST /send` with channel `whatsapp` or `email`).

- [ ] **Step 3: Log the interaction**

POST to contact-engine `/interactions` to record the alert was sent.

- [ ] **Step 4: Commit**

```bash
git add ventures/renewflow/src/app/alerts/
git commit -m "feat: build Flow renewal alerts with AI messaging"
```

---

### Task 7: Build Flow Dashboard — Main Dashboard

**Files:**
- Modify: `ventures/renewflow/src/app/page.tsx`

- [ ] **Step 1: Build dashboard with real metrics**

- Total assets (from API)
- Assets expiring in 30 days (filtered query)
- Active deals + total pipeline value
- Recent alerts sent

- [ ] **Step 2: Renewal pipeline visualization**

Show asset counts by status: discovered → alerted → quoted → approved → fulfilled.

- [ ] **Step 3: Commit**

```bash
git add ventures/renewflow/src/app/page.tsx
git commit -m "feat: build Flow dashboard with real-time metrics"
```

---

### Task 8: Rename User-Facing Text to "Flow"

**Files:**
- Modify: `ventures/renewflow/src/app/layout.tsx`
- Modify: `prisma/schema.prisma` (venture description)
- Modify: `ventures/kitz/src/app/ventures/page.tsx` (if hardcoded references remain)

- [ ] **Step 1: Update metadata and titles**

Change `<title>` and metadata from "RenewFlow" to "Flow" in layout.tsx.

- [ ] **Step 2: Update venture description in database**

```bash
curl -X PATCH -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Flow","description":"AI warranty renewal platform for LATAM IT channel partners"}' \
  https://factory-api-production-5486.up.railway.app/ventures/<flow-venture-id>
```

- [ ] **Step 3: Commit**

```bash
git add ventures/renewflow/ ventures/kitz/
git commit -m "chore: rename venture from RenewFlow to Flow in user-facing text"
```

---

### Task 9: Deploy Flow Dashboard

- [ ] **Step 1: Set env vars on renewflow Railway service**

```bash
railway service renewflow
railway variables set "FACTORY_API_URL=https://factory-api-production-5486.up.railway.app"
railway variables set "CONTACT_ENGINE_URL=https://contact-engine-production-a41e.up.railway.app"
railway variables set "AGENT_RUNTIME_URL=https://agent-runtime-production-ac7b.up.railway.app"
railway variables set "CHANNEL_ROUTER_URL=https://channel-router-production.up.railway.app"
railway variables set "API_KEY=<same-key>"
railway variables set "NEXT_PUBLIC_VENTURE_ID=<flow-venture-id>"
```

- [ ] **Step 2: Push and deploy**

```bash
git push origin main
railway service renewflow
railway up --detach
```

- [ ] **Step 3: End-to-end test**

1. Import 5 assets from Excel
2. Select 3 assets, generate a Smart Quote
3. Create a deal from the quote
4. Send a renewal alert for an expiring asset
5. Verify the deal appears in the pipeline
6. Verify the alert appears in interaction logs

---

### Task 10: Operator Experience — Guided Onboarding

**Files:**
- Create: `ventures/renewflow/src/app/onboarding/page.tsx`
- Create: `ventures/renewflow/src/components/onboarding-wizard.tsx`

- [ ] **Step 1: Build 3-step onboarding wizard**

1. **Welcome** — "Hi! Let's set up Flow for your business" + company name input
2. **Import Assets** — Link to import page or drag-drop inline
3. **First Quote** — Auto-select expiring assets, generate a sample quote

Show this page when the venture has 0 assets.

- [ ] **Step 2: Commit**

```bash
git add ventures/renewflow/src/app/onboarding/
git commit -m "feat: add guided onboarding wizard for new Flow operators"
```

---

### Task 11: Operator Experience — Activity Feed

**Files:**
- Create: `ventures/renewflow/src/app/activity/page.tsx`

- [ ] **Step 1: Build activity feed**

Fetch from agent_logs + interactions, merge by timestamp, display as a timeline:
- "AI generated TPM quote for ClientName — $4,200 savings"
- "Renewal alert sent to jose@partner.com via WhatsApp"
- "Deal 'HPE Renewal - TechCorp' moved to qualified"

- [ ] **Step 2: Commit**

```bash
git add ventures/renewflow/src/app/activity/
git commit -m "feat: add activity feed showing AI actions and interactions"
```

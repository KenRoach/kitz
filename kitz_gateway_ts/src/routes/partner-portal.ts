/** Partner Portal — read-only view for delivery partners to view and acknowledge POs.
 *
 * Auth: token-based. Each partner gets a unique token embedded in email links.
 * Routes:
 *   GET  /partner/portal?token=...          — Portal HTML (lists POs)
 *   GET  /partner/api/submissions?token=... — JSON list of submissions
 *   POST /partner/api/acknowledge?token=... — Acknowledge a submission
 */

import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { getSupabase } from "../db/client.js";

/** Generate a deterministic token for a partner (based on partner ID + secret). */
function partnerToken(partnerId: string): string {
  const secret = process.env.PARTNER_TOKEN_SECRET || "renewflow-partner-default-secret";
  return crypto.createHmac("sha256", secret).update(partnerId).digest("hex").slice(0, 32);
}

/** Look up partner by token. */
async function resolvePartner(token: string): Promise<{ id: string; name: string; email: string } | null> {
  if (!token) return null;
  const db = getSupabase();
  const { data } = await db.from("delivery_partners").select("id, name, email").eq("active", true);
  if (!data) return null;
  for (const p of data) {
    if (partnerToken(p.id) === token) return p;
  }
  return null;
}

export async function partnerPortalRoutes(app: FastifyInstance): Promise<void> {
  // JSON API: list submissions for this partner
  app.get("/partner/api/submissions", async (request, reply) => {
    const token = (request.query as { token?: string }).token;
    const partner = await resolvePartner(token ?? "");
    if (!partner) return reply.status(401).send({ error: "Invalid or expired token" });

    const db = getSupabase();
    const { data, error } = await db
      .from("po_submissions")
      .select("id, order_id, status, created_at, acknowledged_at, fulfilled_at, tracking, order_po(id, client, total, status, items)")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false });

    if (error) return reply.status(500).send({ error: error.message });
    return { partner: { name: partner.name }, submissions: data ?? [] };
  });

  // JSON API: acknowledge a submission
  app.post("/partner/api/acknowledge", async (request, reply) => {
    const token = (request.query as { token?: string }).token;
    const partner = await resolvePartner(token ?? "");
    if (!partner) return reply.status(401).send({ error: "Invalid or expired token" });

    const { submissionId } = (request.body as { submissionId?: string }) ?? {};
    if (!submissionId) return reply.status(400).send({ error: "submissionId required" });

    const db = getSupabase();

    // Verify this submission belongs to this partner
    const { data: sub } = await db.from("po_submissions").select("id, partner_id, order_id").eq("id", submissionId).single();
    if (!sub || sub.partner_id !== partner.id) return reply.status(403).send({ error: "Not your submission" });

    await db.from("po_submissions").update({ status: "acknowledged", acknowledged_at: new Date().toISOString() }).eq("id", submissionId);
    await db.from("order_po").update({ status: "acknowledged", updated: new Date().toISOString().slice(0, 10) }).eq("id", sub.order_id);

    return { submissionId, status: "acknowledged" };
  });

  // HTML portal page
  app.get("/partner/portal", async (request, reply) => {
    const token = (request.query as { token?: string }).token;
    const partner = await resolvePartner(token ?? "");
    if (!partner) {
      return reply.status(401).type("text/html").send("<h1>Invalid or expired link</h1><p>Please use the link from your email.</p>");
    }

    const html = portalHTML(partner.name, token!);
    return reply.type("text/html").send(html);
  });
}

/** Exported so PO emails can include the portal link. */
export { partnerToken };

function portalHTML(partnerName: string, token: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RenewFlow Partner Portal</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',system-ui,sans-serif; background:#f8fafc; color:#1e293b; }
    .header { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:#fff; padding:24px 32px; }
    .header h1 { font-size:20px; font-weight:600; }
    .header p { font-size:14px; color:#94a3b8; margin-top:4px; }
    .container { max-width:900px; margin:24px auto; padding:0 16px; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:16px; }
    .card h3 { font-size:16px; margin-bottom:8px; }
    .badge { display:inline-block; padding:2px 10px; border-radius:12px; font-size:12px; font-weight:600; }
    .badge-submitted { background:#dbeafe; color:#1d4ed8; }
    .badge-acknowledged { background:#dcfce7; color:#16a34a; }
    .badge-fulfilled { background:#f3e8ff; color:#7c3aed; }
    .meta { font-size:13px; color:#64748b; margin-top:4px; }
    .items { margin-top:12px; }
    .items table { width:100%; border-collapse:collapse; font-size:13px; }
    .items th { text-align:left; padding:6px 8px; border-bottom:2px solid #e2e8f0; color:#64748b; }
    .items td { padding:6px 8px; border-bottom:1px solid #f1f5f9; }
    .btn { display:inline-block; padding:8px 16px; background:#0f172a; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; }
    .btn:hover { background:#1e3a5f; }
    .btn:disabled { background:#94a3b8; cursor:default; }
    .empty { text-align:center; padding:48px; color:#94a3b8; }
    #loading { text-align:center; padding:48px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RenewFlow Partner Portal</h1>
    <p>Welcome, ${partnerName}</p>
  </div>
  <div class="container" id="content">
    <div id="loading">Loading submissions...</div>
  </div>
  <script>
    const TOKEN = "${token}";
    async function load() {
      const res = await fetch("/partner/api/submissions?token=" + TOKEN);
      if (!res.ok) { document.getElementById("content").innerHTML = "<p>Error loading data.</p>"; return; }
      const { submissions } = await res.json();
      const c = document.getElementById("content");
      if (!submissions.length) { c.innerHTML = '<div class="empty">No purchase orders yet.</div>'; return; }
      c.innerHTML = submissions.map(s => {
        const order = s.order_po;
        const items = (order?.items || []);
        const badgeClass = "badge-" + s.status;
        const ackBtn = s.status === "submitted"
          ? '<button class="btn" onclick="ack(\\'' + s.id + '\\')">Acknowledge Receipt</button>'
          : "";
        return '<div class="card">' +
          '<h3>PO ' + s.order_id.slice(0,8) + ' — ' + (order?.client || "—") + '</h3>' +
          '<span class="badge ' + badgeClass + '">' + s.status + '</span>' +
          '<div class="meta">Submitted: ' + new Date(s.created_at).toLocaleDateString() +
          (s.acknowledged_at ? " · Acknowledged: " + new Date(s.acknowledged_at).toLocaleDateString() : "") +
          (s.fulfilled_at ? " · Fulfilled: " + new Date(s.fulfilled_at).toLocaleDateString() : "") +
          '</div>' +
          (items.length ? '<div class="items"><table><thead><tr><th>Device</th><th>Coverage</th><th>Price</th></tr></thead><tbody>' +
            items.map(i => '<tr><td>' + (i.brand||"") + " " + (i.model||"") + '</td><td>' + (i.coverageType||"—") + '</td><td>$' + (i.price||0) + '</td></tr>').join("") +
            '</tbody></table></div>' : "") +
          '<div style="margin-top:12px">' + ackBtn + '</div></div>';
      }).join("");
    }
    async function ack(id) {
      const res = await fetch("/partner/api/acknowledge?token=" + TOKEN, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({submissionId: id})
      });
      if (res.ok) load(); else alert("Failed to acknowledge.");
    }
    load();
  </script>
</body>
</html>`;
}

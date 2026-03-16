/** Messaging Fastify routes — WhatsApp connection, outbound, drafts. */

import type { FastifyInstance } from "fastify";
import type { ToolDef } from "../tools/registry.js";
import { BaileysAdapter } from "./baileys.js";
import { handleIncoming } from "./handler.js";
import { getSupabase } from "../db/client.js";
import type { IncomingMessage } from "./types.js";

let _adapter: BaileysAdapter | null = null;

export function getWhatsAppAdapter(): BaileysAdapter | null {
  return _adapter;
}

export async function messagingRoutes(
  app: FastifyInstance,
  opts: { sessionDir: string; tools: ToolDef[] },
): Promise<void> {
  const { sessionDir, tools } = opts;

  // GET /v0.1/whatsapp/connect — SSE stream for QR code
  app.get("/v0.1/whatsapp/connect", async (request, reply) => {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Reuse existing adapter if already connected
    if (_adapter?.isConnected()) {
      send("connected", { status: "already_connected" });
      return;
    }

    // Disconnect old adapter if it exists but isn't connected
    if (_adapter) {
      await _adapter.disconnect();
    }

    const adapter = new BaileysAdapter(sessionDir);
    _adapter = adapter;

    adapter.on("qr", (qr: string) => send("qr", { qr }));
    adapter.on("connected", () => send("connected", { status: "connected" }));
    adapter.on("logged_out", () => send("logged_out", { status: "logged_out" }));
    adapter.on("reconnecting", (info: unknown) => send("reconnecting", info));
    adapter.on("max_reconnects", () => send("error", { message: "Max reconnection attempts reached" }));

    // Handle incoming messages
    adapter.on("message", (msg: IncomingMessage) => {
      void handleIncoming(msg, tools, adapter);
    });

    request.raw.on("close", () => {
      // Don't disconnect adapter on SSE close — keep WhatsApp alive
    });

    await adapter.connect();
    send("init", { status: "connecting", message: "Scan QR code with WhatsApp" });
  });

  // GET /v0.1/whatsapp/status
  app.get("/v0.1/whatsapp/status", async () => {
    return {
      connected: _adapter?.isConnected() ?? false,
      adapter: _adapter ? "baileys" : "none",
    };
  });

  // POST /v0.1/outbound/send — Send a message (creates draft by default)
  app.post("/v0.1/outbound/send", async (request, reply) => {
    const body = request.body as {
      profile_id: string;
      channel?: string;
      to: string;
      content: string;
      auto_send?: boolean;
    };

    if (!body.profile_id || !body.to || !body.content) {
      return reply.status(400).send({ error: "profile_id, to, and content are required" });
    }

    const db = getSupabase();

    if (body.auto_send && _adapter?.isConnected()) {
      // Direct send
      await _adapter.send({
        channel: "whatsapp",
        to: body.to,
        text: body.content,
      });
      return { status: "sent", channel: body.channel || "whatsapp" };
    }

    // Create draft
    const { data, error } = await db
      .from("kz_drafts")
      .insert({
        profile_id: body.profile_id,
        channel: body.channel || "whatsapp",
        recipient: body.to,
        content: body.content,
        status: "pending",
      })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return { status: "draft_created", draft: data };
  });

  // GET /v0.1/drafts — List pending drafts
  app.get("/v0.1/drafts", async (request) => {
    const db = getSupabase();
    const query = request.query as { profile_id?: string; status?: string };

    let q = db.from("kz_drafts").select("*").order("created_at", { ascending: false });
    if (query.profile_id) q = q.eq("profile_id", query.profile_id);
    if (query.status) q = q.eq("status", query.status);

    const { data, error } = await q.limit(50);
    if (error) return { error: error.message };
    return { drafts: data ?? [] };
  });

  // POST /v0.1/drafts/:id/approve — Approve and send a draft
  app.post<{ Params: { id: string } }>("/v0.1/drafts/:id/approve", async (request, reply) => {
    const db = getSupabase();
    const { id } = request.params;

    const { data: draft, error } = await db
      .from("kz_drafts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !draft) return reply.status(404).send({ error: "Draft not found" });

    if (draft.channel === "whatsapp" && _adapter?.isConnected()) {
      await _adapter.send({
        channel: "whatsapp",
        to: draft.recipient,
        text: draft.content,
      });

      await db.from("kz_drafts").update({ status: "sent", updated_at: new Date().toISOString() }).eq("id", id);
      return { status: "sent" };
    }

    return reply.status(400).send({ error: `Channel ${draft.channel} not available` });
  });
}

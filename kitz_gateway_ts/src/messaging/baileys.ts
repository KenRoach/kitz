/** WhatsApp adapter using Baileys (WhatsApp Web API). */

import { EventEmitter } from "node:events";
import { mkdirSync } from "node:fs";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import type { ChannelAdapter, OutboundMessage, IncomingMessage } from "./types.js";

export class BaileysAdapter extends EventEmitter implements ChannelAdapter {
  readonly name = "whatsapp";
  private sock: WASocket | null = null;
  private connected = false;
  private sessionDir: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(sessionDir: string) {
    super();
    this.sessionDir = sessionDir;
    mkdirSync(sessionDir, { recursive: true });
  }

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: { level: "silent", child: () => ({ level: "silent" }) } as unknown as Parameters<typeof makeWASocket>[0]["logger"],
    });

    // QR code events
    this.sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr);
          this.emit("qr", qrDataUrl);
        } catch {
          this.emit("qr", qr); // Emit raw QR if image fails
        }
      }

      if (connection === "close") {
        this.connected = false;
        const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

        if (reason === DisconnectReason.loggedOut) {
          this.emit("logged_out");
          return;
        }

        // Reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          this.emit("reconnecting", { attempt: this.reconnectAttempts, delay });
          setTimeout(() => void this.connect(), delay);
        } else {
          this.emit("max_reconnects");
        }
      }

      if (connection === "open") {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit("connected");
      }
    });

    // Save credentials on update
    this.sock.ev.on("creds.update", saveCreds);

    // Incoming messages
    this.sock.ev.on("messages.upsert", (upsert) => {
      for (const msg of upsert.messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          "";

        if (!text) continue;

        const from = msg.key.remoteJid?.replace("@s.whatsapp.net", "") ?? "";

        const incoming: IncomingMessage = {
          channel: "whatsapp",
          from,
          text,
          timestamp: msg.messageTimestamp as number,
        };

        this.emit("message", incoming);
      }
    });
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.sock || !this.connected) {
      throw new Error("WhatsApp not connected");
    }

    const jid = message.to.includes("@")
      ? message.to
      : `${message.to}@s.whatsapp.net`;

    await this.sock.sendMessage(jid, { text: message.text });
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
      this.connected = false;
    }
  }
}

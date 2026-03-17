/** Gmail tools — search, read, draft, list labels. */

import type { ToolDef } from "./registry.js";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

function getGmail(auth: OAuth2Client) {
  return google.gmail({ version: "v1", auth });
}

export function createGmailTools(auth: OAuth2Client): ToolDef[] {
  const gmail = getGmail(auth);

  return [
    {
      name: "gmail_search",
      description: "Buscar emails en Gmail. Usa sintaxis de búsqueda de Gmail (from:, to:, subject:, is:unread, etc.)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Gmail search query (e.g. 'from:boss is:unread')" },
          max_results: { type: "string", description: "Max messages to return (default 10)" },
        },
        required: ["query"],
      },
      handler: async (args) => {
        const maxResults = parseInt(String(args.max_results || "10"), 10);
        const res = await gmail.users.messages.list({
          userId: "me",
          q: String(args.query),
          maxResults,
        });
        const messages = res.data.messages ?? [];
        const results = [];
        for (const msg of messages.slice(0, maxResults)) {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
            format: "metadata",
            metadataHeaders: ["Subject", "From", "Date"],
          });
          const headers = detail.data.payload?.headers ?? [];
          results.push({
            id: msg.id,
            subject: headers.find((h) => h.name === "Subject")?.value ?? "",
            from: headers.find((h) => h.name === "From")?.value ?? "",
            date: headers.find((h) => h.name === "Date")?.value ?? "",
            snippet: detail.data.snippet ?? "",
          });
        }
        return { count: results.length, messages: results };
      },
    },
    {
      name: "gmail_read",
      description: "Leer el contenido completo de un email por su ID",
      parameters: {
        type: "object",
        properties: {
          message_id: { type: "string", description: "Gmail message ID" },
        },
        required: ["message_id"],
      },
      handler: async (args) => {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: String(args.message_id),
          format: "full",
        });
        const headers = res.data.payload?.headers ?? [];
        const parts = res.data.payload?.parts ?? [];
        let body = "";
        // Try plain text first, then html
        const textPart = parts.find((p) => p.mimeType === "text/plain");
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        } else if (res.data.payload?.body?.data) {
          body = Buffer.from(res.data.payload.body.data, "base64").toString("utf-8");
        }
        return {
          id: res.data.id,
          subject: headers.find((h) => h.name === "Subject")?.value ?? "",
          from: headers.find((h) => h.name === "From")?.value ?? "",
          to: headers.find((h) => h.name === "To")?.value ?? "",
          date: headers.find((h) => h.name === "Date")?.value ?? "",
          body: body.slice(0, 3000),
          labels: res.data.labelIds ?? [],
        };
      },
    },
    {
      name: "gmail_draft",
      description: "Crear un borrador de email en Gmail",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          subject: { type: "string", description: "Email subject" },
          body: { type: "string", description: "Email body (plain text)" },
        },
        required: ["to", "subject", "body"],
      },
      handler: async (args) => {
        const raw = [
          `To: ${args.to}`,
          `Subject: ${args.subject}`,
          "Content-Type: text/plain; charset=utf-8",
          "",
          String(args.body),
        ].join("\r\n");
        const encoded = Buffer.from(raw).toString("base64url");
        const res = await gmail.users.drafts.create({
          userId: "me",
          requestBody: { message: { raw: encoded } },
        });
        return { draft_id: res.data.id, message: "Borrador creado exitosamente" };
      },
    },
    {
      name: "gmail_send",
      description: "Enviar un email directamente desde Gmail",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          subject: { type: "string", description: "Email subject" },
          body: { type: "string", description: "Email body (plain text)" },
        },
        required: ["to", "subject", "body"],
      },
      handler: async (args) => {
        const raw = [
          `To: ${args.to}`,
          `Subject: ${args.subject}`,
          "Content-Type: text/plain; charset=utf-8",
          "",
          String(args.body),
        ].join("\r\n");
        const encoded = Buffer.from(raw).toString("base64url");
        const res = await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw: encoded },
        });
        return { message_id: res.data.id, message: "Email enviado exitosamente" };
      },
    },
    {
      name: "gmail_labels",
      description: "Listar todas las etiquetas/carpetas de Gmail",
      parameters: { type: "object", properties: {} },
      handler: async () => {
        const res = await gmail.users.labels.list({ userId: "me" });
        return { labels: (res.data.labels ?? []).map((l) => ({ id: l.id, name: l.name })) };
      },
    },
  ];
}

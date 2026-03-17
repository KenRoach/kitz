/** Google Drive tools — search, list, read file metadata. */

import type { ToolDef } from "./registry.js";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

function getDrive(auth: OAuth2Client) {
  return google.drive({ version: "v3", auth });
}

export function createDriveTools(auth: OAuth2Client): ToolDef[] {
  const drive = getDrive(auth);

  return [
    {
      name: "drive_search",
      description: "Buscar archivos en Google Drive por nombre o tipo",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query (file name, keyword)" },
          mime_type: { type: "string", description: "Filter by MIME type (e.g. application/pdf, application/vnd.google-apps.spreadsheet)" },
          max_results: { type: "string", description: "Max files to return (default 10)" },
        },
        required: ["query"],
      },
      handler: async (args) => {
        const maxResults = parseInt(String(args.max_results || "10"), 10);
        let q = `name contains '${String(args.query).replace(/'/g, "\\'")}'`;
        if (args.mime_type) q += ` and mimeType = '${args.mime_type}'`;
        q += " and trashed = false";

        const res = await drive.files.list({
          q,
          pageSize: maxResults,
          fields: "files(id, name, mimeType, modifiedTime, size, webViewLink)",
          orderBy: "modifiedTime desc",
        });

        return {
          count: res.data.files?.length ?? 0,
          files: (res.data.files ?? []).map((f) => ({
            id: f.id,
            name: f.name,
            type: f.mimeType,
            modified: f.modifiedTime,
            size: f.size,
            link: f.webViewLink,
          })),
        };
      },
    },
    {
      name: "drive_list_recent",
      description: "Listar archivos recientes de Google Drive",
      parameters: {
        type: "object",
        properties: {
          max_results: { type: "string", description: "Max files (default 10)" },
        },
      },
      handler: async (args) => {
        const maxResults = parseInt(String(args.max_results || "10"), 10);
        const res = await drive.files.list({
          pageSize: maxResults,
          fields: "files(id, name, mimeType, modifiedTime, size, webViewLink)",
          orderBy: "viewedByMeTime desc",
          q: "trashed = false",
        });

        return {
          count: res.data.files?.length ?? 0,
          files: (res.data.files ?? []).map((f) => ({
            id: f.id,
            name: f.name,
            type: f.mimeType,
            modified: f.modifiedTime,
            link: f.webViewLink,
          })),
        };
      },
    },
  ];
}

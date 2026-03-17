/** Google OAuth2 authentication for CLI. */

import { google } from "googleapis";
import { createServer } from "node:http";
import { URL } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/drive.readonly",
];

const TOKEN_DIR = join(homedir(), ".kitz");
const TOKEN_PATH = join(TOKEN_DIR, "google-token.json");

interface StoredToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export async function getGoogleAuth(): Promise<OAuth2Client> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.\n" +
      "Set them in .env or environment. Create credentials at:\n" +
      "https://console.cloud.google.com/apis/credentials"
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, "http://localhost:3456/callback");

  // Try to load existing token
  const stored = await loadToken();
  if (stored) {
    oauth2.setCredentials(stored);
    // Refresh if expired
    if (stored.expiry_date && stored.expiry_date < Date.now()) {
      const { credentials } = await oauth2.refreshAccessToken();
      await saveToken(credentials as StoredToken);
      oauth2.setCredentials(credentials);
    }
    return oauth2;
  }

  // First-time auth: open browser flow
  return authorizeInteractive(oauth2);
}

async function authorizeInteractive(oauth2: OAuth2Client): Promise<OAuth2Client> {
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n🔐 Autorización de Google Workspace necesaria.");
  console.log("Abre esta URL en tu navegador:\n");
  console.log(`  ${authUrl}\n`);

  const code = await waitForCallback();
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  await saveToken(tokens as StoredToken);
  console.log("✅ Google Workspace conectado.\n");
  return oauth2;
}

function waitForCallback(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost:3456");
      const code = url.searchParams.get("code");
      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h2>KitZ CLI — Autorización exitosa</h2><p>Puedes cerrar esta ventana.</p>");
        server.close();
        resolve(code);
      } else {
        res.writeHead(400);
        res.end("Missing code");
      }
    });
    server.listen(3456);
    server.on("error", reject);
    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Google auth timed out — no callback received in 2 minutes"));
    }, 120000);
  });
}

async function loadToken(): Promise<StoredToken | null> {
  try {
    const data = await readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(data) as StoredToken;
  } catch {
    return null;
  }
}

async function saveToken(token: StoredToken): Promise<void> {
  await mkdir(TOKEN_DIR, { recursive: true });
  await writeFile(TOKEN_PATH, JSON.stringify(token, null, 2));
}

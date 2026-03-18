#!/usr/bin/env node
/** KitZ Brain CLI — AI business OS with Google Workspace integration. */

import { createInterface } from "node:readline";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { config } from "dotenv";

// Load .env from kitz-cli/ or parent
config();
config({ path: join(process.cwd(), "..", ".env") });

import { initLlm } from "./llm/router.js";
import { Brain } from "./brain/router.js";
import { ToolRegistry } from "./tools/registry.js";
import { createBuiltinTools } from "./tools/builtin.js";
import { createGmailTools } from "./tools/gmail.js";
import { createCalendarTools } from "./tools/calendar.js";
import { createDriveTools } from "./tools/drive.js";
import { getGoogleAuth } from "./auth/google.js";
import type { CliProfile } from "./brain/systemPrompt.js";

const CONFIG_DIR = join(homedir(), ".kitz");
const PROFILE_PATH = join(CONFIG_DIR, "cli-profile.json");

async function loadProfile(): Promise<CliProfile | null> {
  try {
    const data = await readFile(PROFILE_PATH, "utf-8");
    return JSON.parse(data) as CliProfile;
  } catch {
    return null;
  }
}

async function saveProfile(profile: CliProfile): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(PROFILE_PATH, JSON.stringify(profile, null, 2));
}

async function onboard(rl: createInterface): Promise<CliProfile> {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║     KitZ Brain CLI — Setup           ║");
  console.log("╚══════════════════════════════════════╝\n");

  const ask = (q: string): Promise<string> =>
    new Promise((resolve) => rl.question(q, resolve));

  const name = await ask("  Tu nombre: ");
  const businessName = await ask("  Nombre del negocio: ");
  const businessType = await ask("  Tipo (ej: agencia, startup, consultora, tienda): ");

  const profile: CliProfile = {
    name: name.trim() || "Usuario",
    businessName: businessName.trim() || "Mi Negocio",
    businessType: businessType.trim() || "negocio",
    language: "es",
  };

  await saveProfile(profile);
  console.log(`\n  ✅ Perfil guardado en ${PROFILE_PATH}\n`);
  return profile;
}

function printBanner(): void {
  console.log(`
╔══════════════════════════════════════════════╗
║  🧠 KitZ Brain CLI                          ║
║  AI Business OS + Google Workspace           ║
╠══════════════════════════════════════════════╣
║  Comandos:                                   ║
║    /help    — Ver comandos disponibles        ║
║    /tools   — Listar herramientas             ║
║    /clear   — Limpiar historial               ║
║    /profile — Ver/editar perfil               ║
║    /exit    — Salir                           ║
╚══════════════════════════════════════════════╝
`);
}

async function main(): Promise<void> {
  // 1. Init LLM
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY no configurada. Agrégala a .env o al entorno.");
    process.exit(1);
  }
  initLlm(apiKey);

  // 2. Init Google Workspace
  const registry = new ToolRegistry();
  registry.registerAll(createBuiltinTools());

  const hasGoogle = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (hasGoogle) {
    try {
      const auth = await getGoogleAuth();
      registry.registerAll(createGmailTools(auth));
      registry.registerAll(createCalendarTools(auth));
      registry.registerAll(createDriveTools(auth));
      console.log("  ✅ Google Workspace conectado (Gmail, Calendar, Drive)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ⚠️  Google Workspace no disponible: ${msg}`);
      console.log("     El CLI funcionará sin herramientas de Google.\n");
    }
  } else {
    console.log("  ℹ️  Google Workspace no configurado (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)");
    console.log("     Agrega credenciales para habilitar Gmail, Calendar y Drive.\n");
  }

  // 3. Setup readline
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\n🧠 kitz> ",
  });

  // 4. Load or create profile
  let profile = await loadProfile();
  if (!profile) {
    profile = await onboard(rl);
  }

  printBanner();
  console.log(`  Hola ${profile.name}! Conectado a "${profile.businessName}" (${profile.businessType})`);
  console.log(`  ${registry.list().length} herramientas disponibles\n`);

  // 5. Init brain
  const brain = new Brain(profile, registry.list());

  // 6. REPL
  rl.prompt();

  rl.on("line", async (line: string) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    // Handle slash commands
    if (input.startsWith("/")) {
      switch (input.split(" ")[0]) {
        case "/exit":
        case "/quit":
          console.log("\n  ¡Hasta luego! 👋\n");
          process.exit(0);
          break;
        case "/clear":
          brain.clearHistory();
          console.log("  🗑️  Historial limpiado.\n");
          break;
        case "/tools":
          console.log("\n  Herramientas disponibles:");
          for (const t of registry.list()) {
            console.log(`    • ${t.name} — ${t.description}`);
          }
          console.log();
          break;
        case "/profile":
          console.log(`\n  Nombre: ${profile!.name}`);
          console.log(`  Negocio: ${profile!.businessName} (${profile!.businessType})`);
          console.log(`  Config: ${PROFILE_PATH}\n`);
          break;
        case "/help":
          console.log("\n  Puedes pedirme cosas como:");
          console.log('    "Busca emails de Juan sin leer"');
          console.log('    "¿Qué tengo agendado para mañana?"');
          console.log('    "Agenda una reunión con Ana el viernes a las 10am"');
          console.log('    "Crea un borrador para el cliente X sobre la cotización"');
          console.log('    "Busca el archivo de presupuesto en Drive"');
          console.log('    "¿Cuándo tengo tiempo libre esta semana?"\n');
          break;
        default:
          console.log(`  Comando desconocido: ${input}. Usa /help\n`);
      }
      rl.prompt();
      return;
    }

    // Send to brain
    try {
      process.stdout.write("\n  Pensando...\n");
      const result = await brain.send(input);
      console.log(`\n  ${result.response}\n`);
      if (result.toolsUsed.length > 0) {
        console.log(`  [herramientas: ${result.toolsUsed.join(", ")}]\n`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n  ❌ Error: ${msg}\n`);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\n  ¡Hasta luego! 👋\n");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

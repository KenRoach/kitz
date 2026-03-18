/** Run database migrations on startup using pg directly. */

import pg from "pg";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveSQL(filename: string): string {
  // Try relative to compiled output (dist/db/ -> ../../src/db/)
  const fromDist = join(__dirname, "../../src/db", filename);
  if (existsSync(fromDist)) return readFileSync(fromDist, "utf-8");
  // Try relative to source (src/db/)
  const fromSrc = join(__dirname, filename);
  if (existsSync(fromSrc)) return readFileSync(fromSrc, "utf-8");
  throw new Error(`SQL file not found: ${filename} (tried ${fromDist} and ${fromSrc})`);
}

export async function runMigrations(databaseUrl: string): Promise<void> {
  if (!databaseUrl || databaseUrl === "supabase") {
    console.log("[migrate] No DATABASE_URL configured — skipping migrations");
    return;
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.startsWith("postgresql") || databaseUrl.includes("supabase")
      ? { rejectUnauthorized: true }
      : false,
  });

  try {
    await client.connect();
    console.log("[migrate] Connected to database");

    // Check if assets table exists (proxy for "schema already applied")
    const { rows } = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'assets')"
    );

    if (rows[0].exists) {
      console.log("[migrate] Tables already exist — skipping schema creation");
      await client.end();
      return;
    }

    // Read and execute schema SQL (skip old auth tables)
    const schemaSQL = resolveSQL("schema.sql");
    const kzSQL = resolveSQL("migrations/001_kitzos_tables.sql");
    const notifSQL = resolveSQL("migrations/003_notif_tables.sql");
    const seedSQL = resolveSQL("seed.sql");

    // Filter out old auth tables (users, sessions, password_reset_tokens) — we use Supabase Auth
    const filteredSchema = schemaSQL
      .replace(/CREATE TABLE IF NOT EXISTS users\s*\([^)]+\);/s, "")
      .replace(/CREATE TABLE IF NOT EXISTS sessions\s*\([^)]+\);/s, "")
      .replace(/CREATE TABLE IF NOT EXISTS password_reset_tokens\s*\([^)]+\);/s, "")
      .replace(/CREATE INDEX IF NOT EXISTS idx_sessions_user[^;]+;/s, "")
      .replace(/CREATE INDEX IF NOT EXISTS idx_reset_tokens_user[^;]+;/s, "");

    // Also ensure core_org exists
    const coreOrgSQL = `
      CREATE TABLE IF NOT EXISTS core_org (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      INSERT INTO core_org (id, name, slug)
      VALUES ('a0000000-0000-0000-0000-000000000001', 'RenewFlow Default', 'renewflow')
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log("[migrate] Creating core_org table...");
    await client.query(coreOrgSQL);

    console.log("[migrate] Creating RenewFlow schema tables...");
    await client.query(filteredSchema);

    console.log("[migrate] Creating KitZ(OS) tables...");
    await client.query(kzSQL);

    console.log("[migrate] Creating notification tables...");
    await client.query(notifSQL);

    console.log("[migrate] Seeding sample data...");
    await client.query(seedSQL);

    console.log("[migrate] All migrations completed successfully");
  } catch (err) {
    console.error("[migrate] Migration error:", (err as Error).message);
  } finally {
    await client.end();
  }
}

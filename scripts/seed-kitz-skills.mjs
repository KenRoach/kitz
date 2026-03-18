#!/usr/bin/env node

/**
 * Seed KitZ venture skills into the factory database.
 *
 * Reads skill markdown files from skills/kitz/ and skills/renewflow/,
 * then upserts them into the Prisma skills table via the factory-api.
 *
 * Env vars:
 *   FACTORY_URL — factory-api base URL (default: http://localhost:3000)
 *
 * Or run directly against the database if DATABASE_URL is set.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

const FACTORY_URL = process.env.FACTORY_URL || "http://localhost:3000";

// Venture IDs — match these to your Prisma Venture records
const VENTURES = {
  kitz: { dir: "skills/kitz", ventureId: null },
  renewflow: { dir: "skills/renewflow", ventureId: null },
};

function loadSkills(dir) {
  const skills = [];
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    console.log(`  Skipping ${dir} — directory not found`);
    return skills;
  }

  for (const file of files) {
    const content = readFileSync(join(dir, file), "utf-8");
    const slug = basename(file, ".md");

    // Extract title from first # heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const name = titleMatch ? titleMatch[1].trim() : slug;

    // Extract description from ## Role section (first sentence)
    const roleMatch = content.match(/## Role\s*\n+(.+?)(?:\n|$)/);
    const description = roleMatch
      ? roleMatch[1].replace(/^You are (?:the |an? )?/i, "").split(".")[0] + "."
      : "";

    skills.push({ slug, name, description });
  }
  return skills;
}

async function seedViaAPI(ventureSlug, skills) {
  // First, look up the venture ID
  let ventures;
  try {
    const res = await fetch(`${FACTORY_URL}/ventures`);
    if (!res.ok) throw new Error(`${res.status}`);
    ventures = await res.json();
  } catch (err) {
    console.error(`  Could not reach factory-api at ${FACTORY_URL}: ${err.message}`);
    console.error("  Set FACTORY_URL or start the factory-api service.");
    return false;
  }

  const venture = ventures.find((v) => v.slug === ventureSlug);
  if (!venture) {
    console.error(`  Venture '${ventureSlug}' not found in factory DB. Create it first.`);
    return false;
  }

  let created = 0;
  let skipped = 0;

  for (const skill of skills) {
    try {
      const res = await fetch(`${FACTORY_URL}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId: venture.id,
          name: skill.name,
          slug: skill.slug,
          description: skill.description,
        }),
      });

      if (res.ok) {
        console.log(`  + ${skill.slug} — ${skill.name}`);
        created++;
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409 || (err.message && err.message.includes("Unique"))) {
          console.log(`  = ${skill.slug} — already exists`);
          skipped++;
        } else {
          console.error(`  x ${skill.slug} — ${res.status}: ${JSON.stringify(err)}`);
        }
      }
    } catch (err) {
      console.error(`  x ${skill.slug} — ${err.message}`);
    }
  }

  console.log(`  ${created} created, ${skipped} skipped\n`);
  return true;
}

console.log("\nSeed KitZ Skills\n================\n");

for (const [slug, cfg] of Object.entries(VENTURES)) {
  const skills = loadSkills(cfg.dir);
  if (skills.length === 0) continue;

  console.log(`${slug} (${skills.length} skills):`);

  // Try API-based seeding
  const ok = await seedViaAPI(slug, skills);
  if (!ok) {
    console.log("  Listing skills found on disk instead:\n");
    for (const s of skills) {
      console.log(`    ${s.slug.padEnd(22)} ${s.name}`);
    }
    console.log("");
  }
}

console.log("Done.\n");

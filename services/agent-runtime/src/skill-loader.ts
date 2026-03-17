import { readFile } from "fs/promises";
import { watch, type FSWatcher } from "fs";
import { resolve } from "path";
import { createLogger } from "@kitz/core";

const logger = createLogger("skill-loader");

const SKILLS_BASE_DIR = resolve(process.cwd(), "skills");

const cache = new Map<string, string>();
const watchers = new Map<string, FSWatcher>();

function skillPath(ventureId: string, skill: string): string {
  return resolve(SKILLS_BASE_DIR, ventureId, `${skill}.md`);
}

function cacheKey(ventureId: string, skill: string): string {
  return `${ventureId}/${skill}`;
}

function watchSkillFile(ventureId: string, skill: string, filePath: string): void {
  const key = cacheKey(ventureId, skill);

  if (watchers.has(key)) return;

  try {
    const watcher = watch(filePath, (eventType) => {
      if (eventType === "change" || eventType === "rename") {
        logger.info({ ventureId, skill }, "Skill file changed, invalidating cache");
        cache.delete(key);
      }
    });

    watcher.on("error", (err) => {
      logger.warn({ err, ventureId, skill }, "Skill file watcher error");
      cache.delete(key);
      watchers.delete(key);
    });

    watchers.set(key, watcher);
  } catch {
    logger.debug({ ventureId, skill }, "Could not watch skill file");
  }
}

export async function loadSkill(ventureId: string, skill: string): Promise<string> {
  const key = cacheKey(ventureId, skill);
  const cached = cache.get(key);
  if (cached) return cached;

  const filePath = skillPath(ventureId, skill);

  try {
    const content = await readFile(filePath, "utf-8");
    cache.set(key, content);
    watchSkillFile(ventureId, skill, filePath);
    logger.info({ ventureId, skill, filePath }, "Loaded skill file");
    return content;
  } catch (err) {
    logger.error({ err, ventureId, skill, filePath }, "Failed to load skill file");
    throw new Error(`Skill file not found: ${filePath}`);
  }
}

export function clearSkillCache(): void {
  cache.clear();
  for (const watcher of watchers.values()) {
    watcher.close();
  }
  watchers.clear();
  logger.info("Skill cache cleared");
}

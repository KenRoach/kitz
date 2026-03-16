/** Conversation memory — persists chat history in kz_conversations. */

import { getSupabase } from "../db/client.js";
import type { LlmMessage } from "../llm/types.js";

export async function storeMessage(profileId: string, role: string, content: string): Promise<void> {
  const db = getSupabase();
  const { error } = await db.from("kz_conversations").insert({
    profile_id: profileId,
    role,
    content,
  });
  if (error) {
    console.error(`[memory] Failed to store message for ${profileId}: ${error.message}`);
  }
}

export async function getHistory(profileId: string, limit = 20): Promise<LlmMessage[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from("kz_conversations")
    .select("role, content")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Reverse to get chronological order
  return data.reverse().map((row) => ({
    role: row.role as LlmMessage["role"],
    content: row.content,
  }));
}

export async function clearHistory(profileId: string): Promise<void> {
  const db = getSupabase();
  const { error } = await db.from("kz_conversations").delete().eq("profile_id", profileId);
  if (error) {
    console.error(`[memory] Failed to clear history for ${profileId}: ${error.message}`);
  }
}

/** Supabase client initialization. */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function initSupabase(url: string, serviceKey: string): SupabaseClient {
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function getSupabase(): SupabaseClient {
  if (!_client) throw new Error("Supabase not initialized — call initSupabase() first");
  return _client;
}

import { createClient } from "@supabase/supabase-js";

// ─── Server-side Supabase (admin) ───

export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key || url.includes("placeholder") || url.includes("your-project")) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.");
  }
  return createClient(url, key);
}

// ─── Client-side Supabase (anon) ───

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createClient(url, key);
}

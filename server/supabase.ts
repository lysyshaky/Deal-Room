import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!isConfigured()) {
      throw new Error("Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY");
    }
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

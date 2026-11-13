import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, key } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, key, { db: { schema: "aptora" } });
}

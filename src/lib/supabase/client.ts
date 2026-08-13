import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/config/env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient(url, anonKey);
}

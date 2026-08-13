import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/config/env";

/**
 * Read-only Supabase client for PUBLIC homepage content (banners, programs,
 * announcements). It uses the anon key and no cookies/session, so public
 * queries do not read `cookies()` and therefore do not opt the homepage into
 * dynamic rendering — the page stays statically renderable (great for SEO) and
 * refreshes through `revalidatePath("/")` after admin changes.
 *
 * Only the public RLS policies (the `anon` role) apply here, which is exactly
 * what public content needs. Never use this client for admin reads or any
 * mutation — those must go through the session-aware server client so that
 * `is_admin()` RLS is enforced.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

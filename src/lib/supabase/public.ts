import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/config/env";

/** Seconds to cache public Supabase reads (fetch-level revalidation). Admin
 * edits call `revalidatePath(...)` and `revalidateTag(...)` on every public
 * path, which purges these cache entries immediately, so a long TTL is safe
 * and keeps navigation fast. */
const PUBLIC_READ_REVALIDATE_SECONDS = 3600;

/**
 * Creates a fetch wrapper that routes Supabase reads through Next.js fetch
 * caching with an optional cache tag for explicit invalidation via
 * `revalidateTag(tag)`. Without this, every page render hits Supabase over
 * the network, which is the main cost of the 1–2s per-navigation server time.
 */
function createCachedPublicFetch(tags?: string[]) {
  return function cachedPublicFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const nextInit: RequestInit = { ...init };
    // Supabase-js may tag its own cache strategy; force Next's revalidate cache.
    nextInit.cache = undefined;
    (nextInit as RequestInit & { next?: Record<string, unknown> }).next = {
      revalidate: PUBLIC_READ_REVALIDATE_SECONDS,
      ...(tags ? { tags } : {}),
    };
    return fetch(input, nextInit);
  };
}

const defaultFetch = createCachedPublicFetch();

/**
 * Read-only Supabase client for PUBLIC homepage content (banners, programs,
 * announcements). It uses the anon key and no cookies/session, so public
 * queries do not read `cookies()` and therefore do not opt the homepage into
 * dynamic rendering — the page stays statically renderable (great for SEO) and
 * refreshes through `revalidatePath("/")` / `revalidateTag(...)` after admin
 * changes.
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
    global: { fetch: defaultFetch },
  });
}

/**
 * Tagged variant of the public client used for Program queries. Fetch results
 * are tagged with `"programs"` so that `revalidateTag("programs")` from admin
 * server actions immediately invalidates stale data on both the homepage and
 * `/events-schedule` without relying solely on `revalidatePath`.
 */
export function createSupabaseProgramClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: createCachedPublicFetch(["programs"]) },
  });
}

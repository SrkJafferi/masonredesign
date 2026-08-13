import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthContext = {
  user: User | null;
  isAdmin: boolean;
};

/**
 * Resolves the current user and whether they hold the admin role. Cached per
 * request so multiple callers (middleware-adjacent layouts, guards, pages)
 * share a single round-trip. Reads through RLS with the user's own session,
 * so the profiles lookup only succeeds for the caller's own row.
 */
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, isAdmin: profile?.role === "admin" };
});

import "server-only";

import { redirect } from "next/navigation";

import { getAuthContext, type AuthContext } from "@/features/auth/session";

const LOGIN_PATH = "/admin/login";

/**
 * App-level authorization guard used inside the /admin layout and Server
 * Actions. This is defense-in-depth on top of RLS — the database will reject a
 * non-admin mutation regardless, but this gives a clean redirect and avoids
 * rendering the admin shell to unauthorized users.
 *
 * - No session      -> /admin/login
 * - Session, no role -> /admin/login?error=unauthorized (login page shows why)
 */
export async function requireAdmin(): Promise<
  AuthContext & { user: NonNullable<AuthContext["user"]> }
> {
  const context = await getAuthContext();

  if (!context.user) {
    redirect(LOGIN_PATH);
  }

  if (!context.isAdmin) {
    redirect(`${LOGIN_PATH}?error=unauthorized`);
  }

  return { user: context.user, isAdmin: true };
}

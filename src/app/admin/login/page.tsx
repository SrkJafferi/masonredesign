import { redirect } from "next/navigation";

import { signOutAction } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthContext } from "@/features/auth/session";
import { Button } from "@/components/ui/button";

function safeRedirect(value: string | undefined): string {
  return value && value.startsWith("/admin") && !value.startsWith("//")
    ? value
    : "/admin";
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirectTo);
  const { user, isAdmin } = await getAuthContext();

  if (user && isAdmin) {
    redirect(redirectTo);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold tracking-[0.24em] text-brand-600 uppercase">
            MASOM
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage banners, programs and announcements.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card sm:p-8">
          {user && !isAdmin ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-foreground">
                You are signed in as <span className="font-semibold">{user.email}</span>,
                but this account does not have admin access.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact the site administrator to be granted access.
              </p>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="w-full">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <LoginForm redirectTo={redirectTo} />
          )}
        </div>
      </div>
    </main>
  );
}

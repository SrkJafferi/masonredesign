import { ShieldCheckIcon } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { signOutAction } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { getAuthContext } from "@/features/auth/session";

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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Full-bleed mosque background */}
      <Image
        src="/brand/login-mosque.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-ink-900/70" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/30 to-ink-900/85"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="light" />
        </div>

        {/* Glassmorphism card */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-7 shadow-elevated ring-1 ring-white/10 backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <ShieldCheckIcon className="size-6" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Sign in to manage banners, programs and announcements.
            </p>
          </div>

          {user && !isAdmin ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-white/80">
                You are signed in as <span className="font-semibold text-white">{user.email}</span>,
                but this account does not have admin access.
              </p>
              <p className="text-sm text-white/60">
                Please contact the site administrator to be granted access.
              </p>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
                >
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

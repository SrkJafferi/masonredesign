import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { requireAdmin } from "@/features/auth/guard";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-card">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.24em] text-brand-600 uppercase">
                MASOM
              </span>
              <span className="text-sm font-semibold text-foreground">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              View site
              <ExternalLinkIcon className="size-3.5" />
            </Link>
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground md:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
        <div className="container-page pb-3">
          <AdminNav />
        </div>
      </header>

      <main className="container-page py-8">{children}</main>
    </div>
  );
}

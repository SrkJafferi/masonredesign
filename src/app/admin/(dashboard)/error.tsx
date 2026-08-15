"use client";

import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server-side in dev; never surfaced to the user.
    console.error("[admin:page]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex min-h-[45vh] flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-card"
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-6" aria-hidden="true" />
      </span>
      <div>
        <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          An unexpected error occurred while loading this section. Your data is safe — try
          again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

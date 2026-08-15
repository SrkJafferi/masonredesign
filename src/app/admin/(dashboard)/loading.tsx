/**
 * Route-level loading UI for the admin content area. The App Router keeps the
 * parent layout (sidebar/nav + header) mounted, so only this content skeleton
 * swaps in while a child page streams its data — no full-screen blank state.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading admin section">
      {/* Page title placeholder */}
      <div>
        <div className="h-7 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      </div>

      {/* Stat / card placeholders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="size-10 animate-pulse rounded-lg bg-muted" />
              <div className="size-4 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-4 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-36 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table placeholder */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="size-9 animate-pulse rounded-lg bg-muted" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="ml-auto h-3.5 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}

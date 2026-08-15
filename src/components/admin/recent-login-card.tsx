import { FingerprintIcon, MapPinIcon } from "lucide-react";

import { maskIp } from "@/lib/auth/login-audit";
import type { AdminLoginRecord } from "@/lib/cms/activity";
import { formatRelativeTime } from "@/lib/format/relative-time";
import { countryFlagEmoji } from "@/lib/geo/countries";

type RecentLoginCardProps = {
  login: AdminLoginRecord | null;
  /** Server-side \"now\" so the timestamp matches the page render. */
  now: number;
};

/**
 * The current admin's latest successful sign-in: country flag/name, city and
 * region (only when the platform supplied them), masked IP and relative time.
 * Never guesses a location — Vercel's trusted geo headers feed this server-side.
 */
export function RecentLoginCard({ login, now }: RecentLoginCardProps) {
  const hasLocation = Boolean(login?.country_name || login?.country_code);
  const flag = countryFlagEmoji(login?.country_code);
  const masked = maskIp(login?.ip_address);
  const locationLine = [login?.city, login?.region].filter(Boolean).join(", ");

  return (
    <section
      aria-labelledby="recent-login-heading"
      className="flex h-full flex-col rounded-2xl border border-border/60 bg-card shadow-card"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <h2
          id="recent-login-heading"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-brand-700 uppercase"
        >
          <FingerprintIcon aria-hidden="true" className="size-4" />
          Recent Login
        </h2>
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        {login ? (
          <>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-xl ring-1 ring-inset ring-brand-500/20"
              >
                {flag ?? <MapPinIcon className="size-5 text-brand-700" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {login.country_name ?? login.country_code ?? "Location unavailable"}
                </p>
                {locationLine ? (
                  <p className="truncate text-sm text-muted-foreground">{locationLine}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {hasLocation ? "Region unavailable" : ""}
                  </p>
                )}
              </div>
            </div>

            <dl className="space-y-1.5 text-sm">
              {masked ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">IP address</dt>
                  <dd className="font-mono font-medium text-foreground tabular-nums">
                    {masked}
                  </dd>
                </div>
              ) : null}
              {login.user_agent_summary ? (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Browser</dt>
                  <dd className="font-medium text-foreground">{login.user_agent_summary}</dd>
                </div>
              ) : null}
            </dl>

            <p className="mt-auto border-t border-border/40 pt-3 text-xs font-semibold text-muted-foreground">
              Logged in{" "}
              <time dateTime={login.created_at} className="font-bold text-foreground">
                {formatRelativeTime(login.created_at, now)}
              </time>
            </p>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No login recorded yet — your next successful sign-in will appear here.
          </p>
        )}
      </div>
    </section>
  );
}

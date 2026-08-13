import { MegaphoneIcon } from "lucide-react";
import Link from "next/link";

import type { AnnouncementView } from "@/features/announcements/types";

type NewsTickerProps = {
  announcements: AnnouncementView[];
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function TickerItem({ item }: { item: AnnouncementView }) {
  const body = (
    <>
      <span className="text-white/90">{item.message}</span>
      {item.linkLabel ? (
        <span className="font-semibold text-brand-400">{item.linkLabel} &rarr;</span>
      ) : null}
    </>
  );

  return (
    <span className="flex items-center gap-3 text-sm">
      <span className="size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
      {item.href ? (
        isExternal(item.href) ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-brand-400"
          >
            {body}
          </a>
        ) : (
          <Link
            href={item.href}
            className="flex items-center gap-2 transition-colors hover:text-brand-400"
          >
            {body}
          </Link>
        )
      ) : (
        <span className="flex items-center gap-2">{body}</span>
      )}
    </span>
  );
}

/** One full pass of the announcements; two of these tile for a seamless loop. */
function TickerGroup({ announcements }: NewsTickerProps) {
  return (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {announcements.map((item) => (
        <TickerItem key={item.id} item={item} />
      ))}
    </div>
  );
}

/**
 * News / Announcement ticker. A new Phase 4 element that renders only when the
 * CMS has live announcements — an empty list hides it entirely. Uses a pure-CSS
 * marquee (paused on hover; disabled under prefers-reduced-motion globally).
 */
export function NewsTicker({ announcements }: NewsTickerProps) {
  if (announcements.length === 0) return null;

  const durationSeconds = Math.max(24, announcements.length * 7);

  return (
    <aside
      aria-label="Announcements"
      className="border-b border-white/10 bg-ink-900 text-white"
    >
      <div className="container-page flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-brand-500 px-4 py-2.5 text-xs font-bold tracking-[0.16em] text-white uppercase">
          <MegaphoneIcon className="size-4" aria-hidden />
          <span className="hidden sm:inline">Announcements</span>
        </div>

        <div className="group relative flex flex-1 items-center overflow-hidden pl-6">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink-900 to-transparent" />
          <div
            className="flex animate-marquee items-center group-hover:[animation-play-state:paused]"
            style={{ animationDuration: `${durationSeconds}s` }}
          >
            <TickerGroup announcements={announcements} />
            <div aria-hidden className="flex items-center">
              <TickerGroup announcements={announcements} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

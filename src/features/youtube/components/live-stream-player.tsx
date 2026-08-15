"use client";

import { CalendarDaysIcon, PlayIcon, RadioIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { YouTubeStream } from "@/features/youtube/types";

import { StreamCarousel } from "./stream-carousel";

const YOUTUBE_EMBED_BASE = "https://www.youtube.com/embed";

/** Formats an ISO timestamp as "Aug 15, 2026" in the viewer's timezone. */
function formatStreamDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type LiveStreamPlayerProps = {
  featured: YouTubeStream;
  recent: YouTubeStream[];
  isLive: boolean;
};

/**
 * Featured player + previous-streams carousel. The featured video is fixed —
 * the carousel below is purely browsable and never swaps the player.
 */
export function LiveStreamPlayer({ featured, recent, isLive }: LiveStreamPlayerProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live state comes from the data layer (or the stream's own liveStatus).
  const isCurrentLive = isLive || featured.liveStatus === "live";

  // Move focus into the player once the user activates it.
  useEffect(() => {
    if (shouldLoad) iframeRef.current?.focus();
  }, [shouldLoad]);

  return (
    <div>
      {/* Featured player — a single iframe is mounted only after the user
          clicks Play on the poster. The featured stream never changes. */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-elevated",
          // Subtle red accent on the player frame while a stream is live.
          isCurrentLive && "ring-1 ring-danger/50",
        )}
      >
        <div className="relative aspect-video w-full">
          {shouldLoad ? (
            <iframe
              ref={iframeRef}
              src={`${YOUTUBE_EMBED_BASE}/${featured.videoId}`}
              title={`Play ${featured.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShouldLoad(true)}
              aria-label={`Play ${featured.title}`}
              className="group absolute inset-0 block h-full w-full cursor-pointer"
            >
              <Image
                src={featured.thumbnailUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 75rem, 100vw"
                className="object-cover"
              />
              <span
                className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/10 to-ink-900/20"
                aria-hidden="true"
              />
              {/* Live badge — only when the API data says this stream is live. */}
              {isCurrentLive ? (
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-danger px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  <span className="sr-only">This broadcast is live</span>
                  Live Now
                </span>
              ) : null}
              {/* Centered play control — the overlay covers the whole poster,
                  so the circle is dead-center at every viewport/aspect. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid size-16 place-items-center rounded-full bg-white/95 text-ink-900 shadow-elevated transition-transform duration-300 ease-brand group-hover:scale-110 sm:size-20">
                  <PlayIcon className="size-7 fill-current sm:size-9" />
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Featured metadata */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isCurrentLive ? (
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-danger px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              <span className="sr-only">This broadcast is live</span>
              Live Now
            </p>
          ) : null}
          <h3 className="text-xl font-bold text-white sm:text-2xl">{featured.title}</h3>
          <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-sm text-white/70">
            <CalendarDaysIcon className="size-4 text-brand-400" aria-hidden="true" />
            {formatStreamDate(featured.publishedAt)}
            {featured.liveStatus === "upcoming" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-brand-400">
                <RadioIcon className="size-3.5" aria-hidden="true" />
                Upcoming
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Previous streams — browsable single-row carousel. */}
      {recent.length > 0 ? (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-white">Previous Live Streams</h3>
          <StreamCarousel streams={recent} />
        </div>
      ) : null}
    </div>
  );
}

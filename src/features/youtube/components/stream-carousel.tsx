"use client";

import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import type { YouTubeStream } from "@/features/youtube/types";

/** Cap the browsable list so the carousel never grows unbounded. */
const MAX_STREAMS = 10;
/** Auto-advance interval — matches the 4–5s suggestion. */
const AUTO_ADVANCE_MS = 4500;

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

type StreamCarouselProps = {
  streams: YouTubeStream[];
};

/**
 * A single-row, auto-advancing carousel of previous MASOM streams. The cards
 * are thumbnails-only links to YouTube (no iframes), and the featured player
 * above this component is never affected by the carousel.
 */
export function StreamCarousel({ streams }: StreamCarouselProps) {
  const items = streams.slice(0, MAX_STREAMS);
  const trackRef = useRef<HTMLUListElement>(null);
  const measureCardRef = useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();

  const [cardWidth, setCardWidth] = useState(0);
  const [gap, setGap] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Measure the first card and derive how many cards fit per breakpoint, so
  // the slide offset tracks the real rendered width (responsive by nature).
  // Card widths come from fixed CSS classes, so a plain resize listener plus a
  // next-frame double-check is all that's needed — re-measuring mid-animation
  // (e.g. via ResizeObserver) would feed sub-pixel drift back into the offset.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      const track = trackRef.current;
      const card = measureCardRef.current;
      if (!track || !card) return;
      const width = card.getBoundingClientRect().width;
      const trackWidth = track.getBoundingClientRect().width;
      if (width <= 0 || trackWidth <= 0) return;
      setCardWidth(width);
      setGap(parseFloat(getComputedStyle(track).columnGap || "0") || 0);
      setVisibleCount(Math.max(1, Math.round(trackWidth / width)));
    };

    const measureOnFrame = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    measureOnFrame();

    window.addEventListener("resize", measureOnFrame);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureOnFrame);
    };
  }, [items.length]);

  // Clamp the index when the visible count changes (resize/rotation).
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Auto-advance with a wrap-around loop. Paused while hovered or focused,
  // and fully disabled for prefers-reduced-motion.
  const advance = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  useEffect(() => {
    if (reduceMotion || paused || maxIndex <= 0) return;
    const id = window.setInterval(advance, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance, paused, reduceMotion, maxIndex]);

  const offset = -index * (cardWidth + gap);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  return (
    <div>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          const next = event.relatedTarget as Node | null;
          if (!event.currentTarget.contains(next)) setPaused(false);
        }}
      >
        <div className="overflow-hidden">
          <motion.ul
            ref={trackRef}
            aria-label="Previous live streams"
            className="flex gap-4"
            animate={{ x: offset }}
            transition={{
              duration: reduceMotion ? 0 : 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {items.map((stream, itemIndex) => (
              <li
                key={stream.videoId}
                ref={itemIndex === 0 ? measureCardRef : undefined}
                className="w-[85%] shrink-0 sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.6667rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]"
              >
                <StreamCard stream={stream} />
              </li>
            ))}
          </motion.ul>
        </div>

        {maxIndex > 0 ? (
          <>
            <CarouselButton
              dir="prev"
              disabled={!canPrev}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            />
            <CarouselButton
              dir="next"
              disabled={!canNext}
              onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
            />
          </>
        ) : null}
      </div>

      {/* Subtle pagination dots */}
      {maxIndex > 0 ? (
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {Array.from({ length: maxIndex + 1 }, (_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Go to slide ${dotIndex + 1}`}
              aria-current={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-1.5 cursor-pointer rounded-full transition-all duration-300 ease-brand focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
                dotIndex === index
                  ? "w-5 bg-brand-400"
                  : "w-1.5 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CarouselButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = dir === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous streams" : "Next streams"}
      className={cn(
        "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full",
        "border border-white/10 bg-ink-900/70 text-white shadow-card backdrop-blur-sm",
        "transition-all duration-300 ease-brand hover:bg-brand-500",
        "disabled:cursor-default disabled:opacity-30 disabled:hover:bg-ink-900/70",
        "focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
        dir === "prev" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

function StreamCard({ stream }: { stream: YouTubeStream }) {
  const isLive = stream.liveStatus === "live";

  return (
    <a
      href={`https://www.youtube.com/watch?v=${stream.videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-card transition-all duration-300 ease-brand outline-none hover:-translate-y-1 hover:shadow-elevated focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={stream.thumbnailUrl}
          alt={`${stream.title} video thumbnail`}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 85vw"
          className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-[1.03]"
        />
        {/* Live badge — only when the API data says this stream is live. */}
        {isLive ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            <span className="relative flex size-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-white" />
            </span>
            <span className="sr-only">This stream is live</span>
            Live
          </span>
        ) : null}
        {/* Centered play button */}
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="grid size-11 place-items-center rounded-full bg-white/95 text-ink-900 shadow-elevated transition-transform duration-300 ease-brand group-hover:scale-110 group-focus-visible:scale-110">
            <PlayIcon className="size-5 fill-current" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-bold text-foreground">{stream.title}</span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDaysIcon className="size-3.5 text-brand-500" aria-hidden="true" />
          {formatStreamDate(stream.publishedAt)}
        </span>
      </div>
    </a>
  );
}

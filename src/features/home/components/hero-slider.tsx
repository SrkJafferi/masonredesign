"use client";

import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";

import type { HeroBanner } from "@/features/banners/types";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

type HeroSliderProps = {
  slides: HeroBanner[];
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const goNext = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  const autoplayActive = isPlaying && !isInteracting && !shouldReduceMotion && count > 1;

  useEffect(() => {
    if (!autoplayActive) return;
    const timer = window.setTimeout(goNext, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplayActive, index, goNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="MASOM highlights"
      className="relative isolate overflow-hidden bg-ink-900"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative h-[58vh] min-h-[380px] w-full sm:h-[64vh] lg:h-[600px] xl:h-[640px]">
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              aria-hidden={!isActive}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ pointerEvents: isActive ? "auto" : "none" }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ scale: isActive && !shouldReduceMotion ? 1.06 : 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : AUTOPLAY_MS / 1000 + 1,
                  ease: "linear",
                }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-ink-900/40" />
              {slide.href ? (
                <a
                  href={slide.href}
                  className="absolute inset-0 z-[1] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                  aria-label={slide.alt || "Open banner"}
                  tabIndex={isActive ? 0 : -1}
                  {...(isExternal(slide.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                />
              ) : null}
            </motion.div>
          );
        })}

        {/* Previous / next controls */}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-900/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-ink-900/70 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:left-6 sm:size-12"
            >
              <ChevronLeftIcon className="size-5 sm:size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-ink-900/40 text-white backdrop-blur-sm transition-all duration-200 hover:bg-ink-900/70 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none sm:right-6 sm:size-12"
            >
              <ChevronRightIcon className="size-5 sm:size-6" />
            </button>
          </>
        ) : null}

        {/* Pagination + play/pause */}
        {count > 1 ? (
          <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-4 sm:bottom-7">
            <div className="flex items-center gap-2" role="tablist" aria-label="Slides">
              {slides.map((slide, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                      isActive ? "w-8 bg-brand-400" : "w-2 bg-white/50 hover:bg-white/80",
                    )}
                  />
                );
              })}
            </div>

            {!shouldReduceMotion ? (
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                className="flex size-8 items-center justify-center rounded-full border border-white/20 bg-ink-900/40 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-ink-900/70 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
              >
                {isPlaying ? (
                  <PauseIcon className="size-3.5" />
                ) : (
                  <PlayIcon className="size-3.5" />
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {count}
      </p>
    </section>
  );
}

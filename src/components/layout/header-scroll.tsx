"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const SCROLL_TRIGGER_PX = 24;

/**
 * Header scroll polish (no redesign): once the page is scrolled, the header
 * gains a subtle elevation shadow and slightly compacts its vertical padding.
 * A short transition keeps the change smooth, and reduced-motion keeps it
 * instant.
 */
export function HeaderScroll({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > SCROLL_TRIGGER_PX));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "transition-[box-shadow,padding] duration-300 ease-brand motion-reduce:transition-none",
        scrolled && "shadow-nav",
      )}
    >
      <Container
        className={cn(
          "flex flex-col gap-5 transition-[padding] duration-300 ease-brand motion-reduce:transition-none lg:flex-row lg:items-center lg:justify-between lg:gap-12",
          scrolled ? "py-3 lg:py-3.5" : "py-4 lg:py-5",
        )}
      >
        {children}
      </Container>
    </div>
  );
}

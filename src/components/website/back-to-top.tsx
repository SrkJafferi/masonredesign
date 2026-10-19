"use client";

import { ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useSmoothScrollToTop } from "@/components/website/smooth-scroll";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 450;

/**
 * Floating "Back to Top" button. Hidden near the top of the page, fades in
 * after ~450px of scroll, and smooth-scrolls back to the top on click
 * (instant when prefers-reduced-motion).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const scrollToTop = useSmoothScrollToTop();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > SHOW_AFTER_PX));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed right-5 bottom-5 z-50 grid size-11 cursor-pointer place-items-center rounded-full",
        "bg-brand-500 text-white shadow-elevated transition-all duration-300 ease-brand",
        "hover:bg-brand-600 hover:shadow-elevated active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUpIcon className="size-5" aria-hidden="true" />
    </button>
  );
}

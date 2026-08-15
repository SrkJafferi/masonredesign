"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Parallax scroll background: the photo is taller than its section and drifts
 * slowly against the scroll direction, giving a calm "fixed" scroll animation.
 * Fully disabled under prefers-reduced-motion (the photo stays static).
 * Decorative only — aria-hidden.
 */
export function ParallaxBackground({
  src,
  opacity = "opacity-50",
  className,
}: {
  src: string;
  /** Tailwind opacity class applied to the image (e.g. "opacity-50"). */
  opacity?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  if (shouldReduceMotion) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        aria-hidden
        className={cn("object-cover", opacity)}
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      aria-hidden
      style={{ y }}
      className={cn("absolute inset-x-0 -inset-y-[24%]", className)}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className={cn("object-cover", opacity)}
      />
    </motion.div>
  );
}

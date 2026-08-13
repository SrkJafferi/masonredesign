"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const motionTags = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  ul: motion.ul,
} as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds before the reveal animation starts (useful for staggering). */
  delay?: number;
  /** Vertical offset the element rises from. */
  y?: number;
  as?: keyof typeof motionTags;
};

/**
 * Fades and lifts its children into view once. Fully collapses to a simple fade
 * when the user prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motionTags[as];

  return (
    <Tag
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Tag>
  );
}

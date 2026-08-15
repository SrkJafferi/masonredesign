"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

type EvaluationItem = {
  label: string;
  percentage: number;
};

type EvaluationBarsProps = {
  items: EvaluationItem[];
};

const easeBrand: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Percentage bars for the MIS Performance Evaluation section. Widths animate
 * from 0 to their value once the section scrolls into view; under
 * prefers-reduced-motion the final values render instantly, with no expansion.
 * The percentage is always visible as text, so no information relies on color
 * or on the animation.
 */
export function EvaluationBars({ items }: EvaluationBarsProps) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const shouldReduceMotion = useReducedMotion();
  const primaryPercentage = Math.max(...items.map((item) => item.percentage));

  return (
    <ul ref={ref} className="space-y-6">
      {items.map((item, index) => {
        const show = shouldReduceMotion === true || inView;
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-bold text-foreground sm:text-base">{item.label}</p>
              <p className="text-sm font-bold text-brand-600 tabular-nums sm:text-base">
                {item.percentage}%
              </p>
            </div>
            <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted" role="presentation">
              <motion.div
                aria-hidden="true"
                className={
                  item.percentage === primaryPercentage
                    ? "h-full rounded-full bg-brand-500"
                    : "h-full rounded-full bg-sand-400/70"
                }
                initial={{ width: 0 }}
                animate={{ width: show ? `${item.percentage}%` : 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.9, ease: easeBrand, delay: index * 0.08 }
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

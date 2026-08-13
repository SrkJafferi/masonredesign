import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "start" | "center";
  tone?: "light" | "dark";
  as?: "h2" | "h3";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] uppercase",
            tone === "dark" ? "text-brand-400" : "text-brand-600",
          )}
        >
          <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}

      <Heading
        className={cn(
          "text-3xl sm:text-4xl",
          tone === "dark" ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </Heading>

      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed",
            tone === "dark" ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

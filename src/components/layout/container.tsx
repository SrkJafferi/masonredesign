import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: ElementType;
  size?: "page" | "content";
  className?: string;
  children: ReactNode;
};

export function Container({
  as: Tag = "div",
  size = "page",
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(size === "page" ? "container-page" : "container-content", className)}
    >
      {children}
    </Tag>
  );
}

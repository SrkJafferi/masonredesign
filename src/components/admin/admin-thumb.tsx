import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type AdminThumbProps = {
  src: string | null;
  alt: string;
  className?: string;
};

/** Small fixed thumbnail for admin tables; shows a placeholder when empty. */
export function AdminThumb({ src, alt, className }: AdminThumbProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-md bg-muted text-muted-foreground",
          className,
        )}
        aria-hidden
      >
        <ImageIcon className="size-5" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative size-14 overflow-hidden rounded-md bg-muted", className)}
    >
      <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
    </div>
  );
}

import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type AdminThumbProps = {
  src: string | null;
  alt: string;
  className?: string;
  /**
   * Render via a plain <img>: used for external https image URLs whose host
   * is not part of the next/image remotePatterns allowlist.
   */
  external?: boolean;
};

/** Small fixed thumbnail for admin tables; shows a placeholder when empty. */
export function AdminThumb({ src, alt, className, external = false }: AdminThumbProps) {
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
      {external ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
      )}
    </div>
  );
}

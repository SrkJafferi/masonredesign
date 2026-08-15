"use client";

import { ParallaxBackground } from "@/components/website/parallax-background";

/** Parallax photo background for the newsletter section. */
export function NewsletterBackground({ src }: { src: string }) {
  return <ParallaxBackground src={src} opacity="opacity-50" />;
}

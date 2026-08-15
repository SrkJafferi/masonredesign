"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";

/** Minimum time the brand mark is visible so it never just flashes. */
const MIN_VISIBLE_MS = 350;
/** Safety cap so the loader can never block a slow-loading page. */
const SAFETY_CAP_MS = 1500;
/** Fade-out duration once the page is ready. */
const FADE_MS = 300;

/**
 * Branded, purely decorative page loader. It fades out as soon as the window
 * fires `load` (or the document is already complete), never adds an artificial
 * delay, and is pointer-events-none so it can never block or trap the user.
 * It only mounts on full page loads — client-side navigation reuses the
 * layout, so it won't flash on every internal interaction.
 */
export function PageLoader() {
  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");

  useEffect(() => {
    const dismiss = () => setPhase((current) => (current === "visible" ? "leaving" : current));

    // Let the logo paint for one frame before listening for readiness.
    const minTimer = window.setTimeout(() => {
      if (document.readyState === "complete") {
        dismiss();
      } else {
        window.addEventListener("load", dismiss, { once: true });
      }
    }, MIN_VISIBLE_MS);

    const safetyTimer = window.setTimeout(dismiss, SAFETY_CAP_MS);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener("load", dismiss);
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => setPhase("gone"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "gone") return null;

  const logo = siteConfig.assets.logoLight;

  return (
    <div
      role="status"
      aria-label={`Loading ${siteConfig.name}`}
      aria-hidden={phase !== "visible"}
      className={[
        "pointer-events-none fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-ink-900",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        phase === "leaving" ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <Image
        src={logo.src}
        alt=""
        width={logo.width}
        height={logo.height}
        priority
        className="h-16 w-auto animate-loader-logo motion-reduce:animate-none sm:h-20"
      />

      <span className="relative block h-1 w-36 overflow-hidden rounded-full bg-white/10 motion-reduce:hidden">
        <span
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-brand-400 animate-loader-shimmer motion-reduce:hidden"
          aria-hidden="true"
        />
      </span>

      <span className="sr-only">Loading {siteConfig.name} Islamic Center</span>
    </div>
  );
}

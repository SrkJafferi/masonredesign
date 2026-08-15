import Image from "next/image";

import { siteConfig } from "@/config/site";

/**
 * App Router route-loading UI for the website. Shown the moment a client-side
 * navigation starts (and while a server-rendered route streams), so the user
 * gets immediate branded feedback instead of a "dead" page. It disappears as
 * soon as the destination payload arrives — no artificial delay.
 */
export default function WebsiteLoading() {
  const logo = siteConfig.assets.logoLight;

  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[55vh] items-center justify-center py-16"
    >
      <div className="flex flex-col items-center gap-4">
        <Image
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          className="h-12 w-auto animate-loader-logo opacity-80 motion-reduce:animate-none"
        />
        <span className="relative block h-1 w-36 overflow-hidden rounded-full bg-brand-100/70 motion-reduce:hidden">
          <span
            className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-brand-500 animate-loader-shimmer motion-reduce:hidden"
            aria-hidden="true"
          />
        </span>
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  );
}

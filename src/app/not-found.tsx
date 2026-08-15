import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink-900 px-6 text-center">
      <BrandLogo variant="light" className="opacity-95" />

      <div className="mt-2 flex flex-col items-center gap-3">
        <p className="text-xs font-bold tracking-[0.3em] text-brand-400 uppercase">404</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Page not found</h1>
        <p className="max-w-md text-sm leading-relaxed text-white/60">
          The page you are looking for does not exist or has been moved. Let&apos;s get you back
          to the {siteConfig.name} homepage.
        </p>
      </div>

      <Button
        asChild
        variant="secondary"
        className="h-11 bg-white px-6 text-sm font-bold text-brand-700 hover:bg-white/90"
      >
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}

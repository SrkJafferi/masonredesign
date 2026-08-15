import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Coming Soon",
  description: "This section of the MASOM website is currently being prepared.",
  path: "/coming-soon",
  noIndex: true,
});

export default function ComingSoonPage() {
  return (
    <section className="relative isolate flex min-h-[65vh] items-center overflow-hidden bg-ink-900 py-20 sm:py-24 lg:py-28">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(92,184,178,0.14),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sand-400/40 to-transparent"
        aria-hidden="true"
      />
      <Container className="relative">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <BrandLogo variant="light" imageClassName="h-14 w-auto lg:h-16" />

          <h1 className="mt-10 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Coming Soon
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
            This section of our website is currently being prepared.
          </p>

          <Link
            href="/"
            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            Back to Home
          </Link>
        </Reveal>
      </Container>
      <div
        className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand-400/50 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}

import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import {
  featureBanners,
  featureHighlights,
  featureQuickLinks,
} from "@/features/home/data/feature-cards";

export function FeatureGrid() {
  return (
    <Container as="section" className="py-16 sm:py-20 lg:py-24">
      {/* Three primary banner blocks */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {featureBanners.map((banner, index) => (
          <Reveal key={banner.id} delay={index * 0.08}>
            <Link
              href={banner.href}
              className="group relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-elevated"
            >
              <Image
                src={banner.image.src}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-600/70 mix-blend-multiply transition-colors duration-300 group-hover:bg-brand-600/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 to-transparent" />
              <h3 className="relative px-6 text-center text-lg font-bold tracking-wide text-white uppercase sm:text-xl">
                {banner.title}
                <span className="mx-auto mt-3 block h-0.5 w-10 origin-center scale-x-100 bg-white/70 transition-transform duration-300 group-hover:scale-x-150" />
              </h3>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-3">
        {/* Two large highlight cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
          {featureHighlights.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.08} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
                <Link
                  href={item.href}
                  className="relative block aspect-[3/2] overflow-hidden"
                >
                  <Image
                    src={item.image.src}
                    alt={`${item.title} ${item.subtitle}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-foreground">
                    <Link
                      href={item.href}
                      className="transition-colors duration-200 hover:text-brand-600"
                    >
                      {item.title}
                      <span className="ml-1.5 font-normal text-brand-600">
                        {item.subtitle}
                      </span>
                    </Link>
                  </h3>
                  {item.excerpt ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {item.excerpt}
                    </p>
                  ) : null}
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-colors duration-200 hover:text-brand-700"
                  >
                    Read more
                    <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Quick-link tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {featureQuickLinks.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.06} className="h-full">
              <Link
                href={item.href}
                className="group relative flex min-h-[92px] items-center overflow-hidden rounded-xl shadow-card transition-shadow duration-300 hover:shadow-elevated lg:min-h-[84px]"
              >
                <Image
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition-transform duration-[900ms] ease-brand group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink-900/70 transition-colors duration-300 group-hover:bg-ink-900/60" />
                <span className="relative flex w-full items-center justify-between gap-3 px-5">
                  <span className="text-base font-bold text-white">{item.title}</span>
                  <ArrowUpRightIcon className="size-5 shrink-0 text-brand-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </Container>
  );
}

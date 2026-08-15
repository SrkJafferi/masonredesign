import { ArrowUpRightIcon, MessageCircleIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { siteConfig } from "@/config/site";

/**
 * The official MASOM WhatsApp invite link — the same one already promoted on
 * the homepage ("Join Our Whats App Events Group" card). Kept in siteConfig so
 * the component never needs editing if the invite URL changes.
 */
const whatsappCommunityUrl = siteConfig.social.whatsapp;

export function WhatsAppCommunityCta() {
  return (
    <section
      aria-labelledby="whatsapp-community-heading"
      className="bg-muted/40 py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
            {/* Top accent line — consistent with the other homepage cards. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
            />
            {/* Subtle decorative glow behind the icon. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-28 -left-28 size-72 rounded-full bg-brand-500/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-7 px-7 py-9 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-12">
              {/* Left: WhatsApp visual + community label */}
              <div className="flex shrink-0 flex-col items-start gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 ring-1 ring-inset ring-brand-500/20 sm:size-16">
                  <MessageCircleIcon className="size-7 sm:size-8" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                  MASOM Community
                </span>
              </div>

              {/* Center: heading + supporting text */}
              <div className="min-w-0 flex-1">
                <h2
                  id="whatsapp-community-heading"
                  className="text-2xl font-bold text-foreground sm:text-3xl"
                >
                  Connected with MASOM
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Join the MASOM WhatsApp Community to stay connected with the latest programs,
                  announcements, prayer updates and important community information.
                </p>
                <p className="mt-4 text-xs font-bold tracking-[0.18em] text-brand-600/80 uppercase">
                  Announcements &middot; Programs &middot; Community Updates
                </p>
              </div>

              {/* Right: primary CTA */}
              <a
                href={whatsappCommunityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 py-4 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 lg:w-auto"
              >
                <MessageCircleIcon className="size-5" aria-hidden="true" />
                Join WhatsApp Community
                <ArrowUpRightIcon
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

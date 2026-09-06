import { ArrowRightIcon } from "lucide-react";

import { siteConfig } from "@/config/site";
import { BotanicalSprig } from "@/features/home/components/botanical-sprig";
import { WhatsAppIcon } from "@/features/home/components/whatsapp-icon";

/**
 * The official MASOM WhatsApp invite link — the same one already promoted on
 * the homepage ("Join Our Whats App Events Group" card). Kept in siteConfig so
 * the component never needs editing if the invite URL changes.
 */
const whatsappCommunityUrl = siteConfig.social.whatsapp;

/**
 * Premium "Connected with MASOM" banner card. Rendered inside the shared
 * community/contact section (StayInTouch) — it deliberately has no section or
 * vertical padding of its own so the two parts read as one composition.
 */
export function WhatsAppCommunityCta() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
      {/* Top accent line — consistent with the other homepage cards. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-400 via-sand-400 to-transparent"
      />
      {/* Soft teal glow behind the icon area. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -left-24 size-80 rounded-full bg-brand-500/10 blur-3xl"
      />
      {/* Faint botanical leaves in the top-right corner. */}
      <BotanicalSprig className="pointer-events-none absolute -top-6 -right-3 w-36 rotate-[150deg] text-brand-500/25 sm:w-44" />

      <div className="relative flex flex-col gap-7 px-7 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:gap-9 lg:px-12">
        {/* Left: WhatsApp visual + community label */}
        <div className="flex items-center gap-4 lg:shrink-0 lg:flex-col lg:items-start lg:gap-3 lg:border-r lg:border-dashed lg:border-border/80 lg:pr-10">
          <span className="relative grid size-16 place-items-center rounded-full bg-brand-500/10 text-brand-600 ring-1 ring-brand-500/25">
            <span
              aria-hidden="true"
              className="absolute -inset-2 -z-10 rounded-full bg-brand-400/15 blur-xl"
            />
            <WhatsAppIcon className="size-8" />
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
            Join the MASOM WhatsApp Community to stay connected with the latest
            programs, announcements, prayer updates and important community
            information.
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
          className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-7 py-4 text-sm font-bold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 lg:w-auto"
        >
          Join WhatsApp Community
          <ArrowRightIcon
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
}

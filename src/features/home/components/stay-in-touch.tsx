import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { siteConfig } from "@/config/site";
import { WhatsAppCommunityCta } from "@/features/home/components/whatsapp-community-cta";

const { contact } = siteConfig;

/** Faint teal dot grid used as a barely-there texture behind the section. */
const dotGrid = {
  backgroundImage:
    "radial-gradient(circle, rgba(92, 184, 178, 0.14) 1px, transparent 1.4px)",
  backgroundSize: "30px 30px",
  maskImage: "linear-gradient(to bottom, black, transparent 78%)",
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent 78%)",
};

function ContactCardShell({
  href,
  external,
  children,
  className,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated sm:p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${className ?? ""}`}
    >
      {children}
    </a>
  );
}

function IconBadge({ icon: Icon }: { icon: typeof MapPinIcon }) {
  return (
    <span className="grid size-14 place-items-center rounded-full bg-brand-100 text-brand-600 ring-1 ring-brand-500/10 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
      <Icon className="size-6" aria-hidden="true" />
    </span>
  );
}

export function StayInTouch() {
  return (
    <section
      aria-labelledby="stay-in-touch-heading"
      className="relative isolate overflow-hidden bg-gradient-to-b from-sand-100/60 via-background to-background"
    >
      {/* Decorative glows + faint dot texture (aria-hidden, non-interactive). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 size-[34rem] rounded-full bg-brand-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 size-[30rem] rounded-full bg-sand-400/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={dotGrid}
      />

      <Container className="relative py-14 sm:py-16 lg:py-20">
        {/* WhatsApp community banner */}
        <Reveal>
          <WhatsAppCommunityCta />
        </Reveal>

        {/* Contact intro + cards — ~38/62 editorial split, vertically balanced. */}
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[5fr_8fr] lg:items-center lg:gap-12">
          {/* Left: intro column */}
          <div>
            <Reveal>
              <div className="flex flex-col">
                <p className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
                  <span className="h-px w-7 bg-current opacity-50" aria-hidden="true" />
                  Our Contacts
                </p>
                <h2
                  id="stay-in-touch-heading"
                  className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Stay in Touch
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                  Questions, visits, community updates — we&rsquo;re here to
                  help.
                </p>

                {/* Small refined teal accent */}
                <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-px w-12 bg-gradient-to-r from-brand-500 to-transparent" />
                  <span className="size-1.5 rounded-full bg-brand-500/60" />
                  <span className="size-1 rounded-full bg-sand-400/70" />
                  <span className="size-1 rounded-full bg-sand-400/40" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: asymmetric contact cards */}
          <div className="grid content-start gap-5 sm:grid-cols-2">
            {/* Our Location — large teaser card spanning the full column width,
            anchoring to the map section below. */}
            <Reveal className="sm:col-span-2">
              <ContactCardShell
                href="#location"
                className="bg-gradient-to-br from-card via-card to-brand-50/70"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-16 size-52 rounded-full bg-brand-500/10 blur-2xl"
                />
                {/* Faint oversized map pin watermark hinting at the map below. */}
                <MapPinIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -bottom-8 size-44 text-brand-500/10 transition-transform duration-300 group-hover:scale-105 group-hover:text-brand-500/15"
                />
                <div className="flex items-start gap-4">
                  <IconBadge icon={MapPinIcon} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                      Masom Imambargah
                    </p>
                    <p className="mt-1.5 font-heading text-xl leading-snug font-bold text-foreground">
                      Our Location
                    </p>
                  </div>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Find MASOM Imambargah in Chicago and view directions on the
                  map below.
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  View Map
                  <ArrowDownIcon
                    className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </ContactCardShell>
            </Reveal>

            {/* Call Us */}
            <Reveal delay={0.08}>
              <ContactCardShell href={contact.phoneHref}>
                <div className="flex items-start gap-4">
                  <IconBadge icon={PhoneIcon} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                      Call Us
                    </p>
                    <p className="mt-1.5 font-heading text-lg font-bold break-words text-foreground">
                      {contact.phone}
                    </p>
                  </div>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  Call now
                  <ArrowUpRightIcon
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </ContactCardShell>
            </Reveal>

            {/* Email Us */}
            <Reveal delay={0.14}>
              <ContactCardShell href={`mailto:${contact.email}`}>
                <div className="flex items-start gap-4">
                  <IconBadge icon={MailIcon} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                      Email Us
                    </p>
                    <p className="mt-1.5 font-heading text-lg font-bold break-all text-foreground">
                      {contact.email}
                    </p>
                  </div>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  Send email
                  <ArrowUpRightIcon
                    className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </ContactCardShell>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

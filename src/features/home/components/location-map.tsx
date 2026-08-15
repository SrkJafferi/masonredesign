import { ExternalLinkIcon, MapPinIcon, NavigationIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { siteConfig } from "@/config/site";

const { contact } = siteConfig;

export function LocationMap() {
  return (
    <Container as="section" className="py-16 sm:py-20 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Our Location"
          title="Find Us at MASOM"
          description="MASOM Imambargah is located in Chicago. Join us for daily prayers, majalis and community programs."
        />
      </Reveal>

      <Reveal delay={0.08} className="mt-10">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card lg:grid lg:grid-cols-5">
          <div className="relative h-72 sm:h-96 lg:col-span-3 lg:h-auto lg:min-h-[26rem]">
            <iframe
              src={contact.address.mapEmbedUrl}
              title={`Google Map showing ${contact.address.full}`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 lg:col-span-2 lg:p-12">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-brand-600 uppercase">
                MASOM Imambargah
              </p>
              <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                Visit Our Imambargah
              </h3>

              <address className="mt-5 not-italic">
                <a
                  href={contact.address.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-3"
                >
                  <MapPinIcon
                    className="mt-1 size-5 shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  <span className="text-lg font-medium leading-relaxed text-foreground transition-colors duration-200 group-hover:text-brand-600">
                    {contact.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </a>
              </address>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={contact.address.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <NavigationIcon aria-hidden="true" className="size-4" />
                Get Directions
              </a>
              <a
                href={contact.address.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:text-brand-600"
              >
                Open in Google Maps
                <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </Container>
  );
}

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/website/reveal";
import { SectionHeading } from "@/components/website/section-heading";
import { siteConfig } from "@/config/site";

type ContactCard = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
  external?: boolean;
  lines: readonly string[];
};

const { contact } = siteConfig;

const contactCards: ContactCard[] = [
  {
    id: "phone",
    label: "Call Us",
    icon: PhoneIcon,
    href: contact.phoneHref,
    lines: [contact.phone],
  },
  {
    id: "address",
    label: "Visit Us",
    icon: MapPinIcon,
    href: contact.address.mapUrl,
    external: true,
    lines: contact.address.lines,
  },
  {
    id: "email",
    label: "Email Us",
    icon: MailIcon,
    href: `mailto:${contact.email}`,
    lines: [contact.email],
  },
];

export function StayInTouch() {
  return (
    <Container as="section" className="py-16 sm:py-20 lg:py-24">
      <Reveal>
        <SectionHeading eyebrow="Our Contacts" title="Stay in Touch" />
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {contactCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.id} delay={index * 0.08} className="h-full">
              <a
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-8 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-elevated"
              >
                <span className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="size-7" />
                </span>
                <span className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase">
                  {card.label}
                </span>
                <span className="text-base font-medium text-foreground transition-colors duration-200 group-hover:text-brand-600">
                  {card.lines.map((line) => (
                    <span key={line} className="block leading-relaxed">
                      {line}
                    </span>
                  ))}
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}

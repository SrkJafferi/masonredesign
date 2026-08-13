import { MapPinIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/website/social-links";
import { siteConfig } from "@/config/site";
import { headerSocialLinks } from "@/config/social";
import { cn } from "@/lib/utils";

type TopBarProps = {
  className?: string;
};

export function TopBar({ className }: TopBarProps) {
  const { contact, links } = siteConfig;

  return (
    <div
      className={cn("border-b-[5px] border-sand-400 bg-ink-900 text-white/85", className)}
    >
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <li>
            <a
              href={contact.phoneHref}
              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-brand-400"
            >
              <PhoneIcon className="size-4 text-brand-400" aria-hidden="true" />
              <span className="font-bold tabular-nums">{contact.phone}</span>
            </a>
          </li>
          <li className="hidden lg:block">
            <a
              href={contact.address.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-brand-400"
            >
              <MapPinIcon className="size-4 text-brand-400" aria-hidden="true" />
              <span>{contact.address.full}</span>
            </a>
          </li>
        </ul>

        <div className="flex items-center gap-2 sm:gap-4">
          <SocialLinks
            items={headerSocialLinks}
            itemClassName="text-white/80 hover:bg-white/10 hover:text-brand-400 size-8"
          />
          <Button asChild variant="cta" size="pill" className="h-8 px-4 sm:h-9 sm:px-5">
            <Link href={links.donate}>Donate Now</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

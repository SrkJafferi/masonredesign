import { ChevronRightIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Container } from "@/components/layout/container";
import { SocialLinks } from "@/components/website/social-links";
import { footerNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { footerSocialLinks } from "@/config/social";
import type { NavGroup } from "@/types/navigation";

const headingClassName =
  "font-heading text-base font-bold tracking-[0.06em] text-white uppercase";

function FooterNavColumn({ group }: { group: NavGroup }) {
  return (
    <nav aria-labelledby={`footer-${group.title.replace(/\s+/g, "-").toLowerCase()}`}>
      <h2
        id={`footer-${group.title.replace(/\s+/g, "-").toLowerCase()}`}
        className={headingClassName}
      >
        {group.title}
      </h2>
      <span className="mt-2 block h-0.5 w-10 rounded-full bg-brand-500" aria-hidden />

      <ul className="mt-4 space-y-2.5 text-sm">
        {group.items.map((item) => (
          <li key={item.label}>
            {item.href === "#" ? (
              <span
                aria-disabled="true"
                className="inline-flex items-start gap-2 text-white/40"
              >
                <ChevronRightIcon
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500/60"
                  aria-hidden="true"
                />
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="group inline-flex items-start gap-2 text-white/75 transition-colors duration-200 hover:text-brand-400"
              >
                <ChevronRightIcon
                  className="mt-0.5 size-3.5 shrink-0 text-brand-500 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const { assets, contact, copyright, name } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-white/75">
      <Container className="grid gap-10 pt-10 pb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="space-y-5">
          <BrandLogo variant="light" imageClassName="h-12 w-auto lg:h-14" />

          <SocialLinks
            items={footerSocialLinks}
            className="-ml-2"
            itemClassName="text-white/80 hover:bg-white/10 hover:text-brand-400"
          />

          <Image
            src={assets.qrCode.src}
            alt={`QR code linking to the ${name} website`}
            width={assets.qrCode.width}
            height={assets.qrCode.height}
            className="size-16 rounded-sm bg-white p-0.5"
          />
        </div>

        {footerNavigation.map((group) => (
          <FooterNavColumn key={group.title} group={group} />
        ))}

        <div>
          <h2 id="footer-contact-us" className={headingClassName}>
            Contact Us
          </h2>
          <span className="mt-2 block h-0.5 w-10 rounded-full bg-brand-500" aria-hidden />

          <ul className="mt-4 space-y-3 text-sm" aria-labelledby="footer-contact-us">
            <li>
              <a
                href={contact.phoneHref}
                className="inline-flex items-center gap-2.5 transition-colors duration-200 hover:text-brand-400"
              >
                <PhoneIcon
                  className="size-4 shrink-0 text-brand-500"
                  aria-hidden="true"
                />
                <span className="font-bold tabular-nums">{contact.phone}</span>
              </a>
            </li>
            <li>
              <address className="not-italic">
                <a
                  href={contact.address.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 transition-colors duration-200 hover:text-brand-400"
                >
                  <MapPinIcon
                    className="mt-0.5 size-4 shrink-0 text-brand-500"
                    aria-hidden="true"
                  />
                  <span>
                    {contact.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </a>
              </address>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-4">
          <p className="text-center text-sm text-white/60">
            <Link
              href="/"
              className="font-bold text-white/80 transition-colors duration-200 hover:text-brand-400"
            >
              {copyright.holder}
            </Link>{" "}
            &copy; {year} {copyright.notice}
          </p>
        </Container>
      </div>
    </footer>
  );
}
